const express = require("express");
const router = express.Router();
const busModel = require('../models/busModel');
const edgeModel = require('../models/edgeModel');
const bookingModel = require('../models/bookingModel');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const find_distance = (adjacencyList, source_node_id, destination_node_id) => {
    // use dijstra's algorithm to find the shortest path between the source and destination nodes
    const distance = new Map();
    const visited = new Map();
    const parent = new Map();

    adjacencyList.forEach((value, key) => {
        distance.set(key, Infinity);
        visited.set(key, false);
        parent.set(key, null);
    });
        
    distance.set(source_node_id, 0);

    for (let i = 0; i < adjacencyList.size - 1; i++) {
        let min = Infinity;
        let min_node = null;
        adjacencyList.forEach((value, key) => {
            if (!visited.get(key) && distance.get(key) < min) {
                min = distance.get(key);
                min_node = key;
            }
        });

        if (min_node === null) {
            break;
        }

        visited.set(min_node, true);

        const adjacent_nodes = adjacencyList.get(min_node);
        adjacent_nodes.forEach(node => {
            if (!visited.get(node.node_id) && distance.get(min_node) + node.weight < distance.get(node.node_id)) {
                distance.set(node.node_id, distance.get(min_node) + node.weight);
                parent.set(node.node_id, min_node);
            }
        });
    }

    return distance.get(destination_node_id);
}

router.post('/getAvailableBuses', async (req, res) => {
    if (!req.body.source_node_id || !req.body.destination_node_id || !req.body.day_of_travel) {
        res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        return;
    }

    // create an adjacency list out of the edges using a map, containing the node id as key and an array of adjacent nodes and the edge weight as value
    const edges = await edgeModel.find({});
    const adjacencyList = new Map();
    edges.forEach(edge => {
        if (adjacencyList.has(edge.node_a_id)) {
            adjacencyList.get(edge.node_a_id).push({ node_id: edge.node_b_id, weight: edge.weight });
        } else {
            adjacencyList.set(edge.node_a_id, [{ node_id: edge.node_b_id, weight: edge.weight }]);
        }

        if (adjacencyList.has(edge.node_b_id)) {
            adjacencyList.get(edge.node_b_id).push({ node_id: edge.node_a_id, weight: edge.weight });
        } else {
            adjacencyList.set(edge.node_b_id, [{ node_id: edge.node_a_id, weight: edge.weight }]);
        }
    });

    // get all buses from model
    const buses = await busModel.find({});

    // filter out if the bus is not operational on the day of travel
    let filteredBuses = buses;
    filteredBuses = filteredBuses.filter(bus => {
        return (bus.days_of_operation & req.body.day_of_travel) > 0;
    });

    filteredBuses = filteredBuses.filter(bus => {
        const route = bus.route;
        const source_node_id = req.body.source_node_id;
        const destination_node_id = req.body.destination_node_id;
        const source_index = route.indexOf(source_node_id);
        const destination_index = route.indexOf(destination_node_id);
        return (source_index > -1 && destination_index > -1 && source_index < destination_index && (bus.current_location !== null || route.indexOf(bus.current_location) < source_index));
    });

    // order the buses according to the proximity of the current location to the source node
    filteredBuses.sort((a, b) => {
        const dist1 = find_distance(adjacencyList, a.current_location, req.body.source_node_id);
        const dist2 = find_distance(adjacencyList, b.current_location, req.body.source_node_id);

        return dist1 - dist2;
    });

    // enrich the buses with the distance from the current location to the source node as eta
    filteredBuses = filteredBuses.map(bus => {
        const dist = find_distance(adjacencyList, bus.current_location, req.body.source_node_id);
        return { ...bus._doc, eta: dist };
    });

    res.status(StatusCodes.OK).json({ buses: filteredBuses });
});

router.post("/bookSeat", async (req, res) => {
    if (!req.body.bus_id || !req.body.seat_id || !req.body.start_node_id || !req.body.end_node_id || !req.body.customer_id) {
        res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        return;
    }

    try {
        const query = await busModel.findOne({ _id: req.body.bus_id });
        if (query) {
            const occupied_seats = query.occupied_seats;
            if (occupied_seats[req.body.seat_id]) {
                res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
                return;
            }
            occupied_seats[req.body.seat_id] = true;
            const updatedBus = await busModel.updateOne({ _id: req.body.bus_id }, { occupied_seats });
            const booking = await bookingModel.create({
                customer_id: req.body.customer_id,
                bus_id: req.body.bus_id,
                seat_id: req.body.seat_id,
                start_node_id: req.body.start_node_id,
                end_node_id: req.body.end_node_id,
                cost: 0,
                status: 1
            });
            res.status(StatusCodes.OK).json({ "message": getReasonPhrase(StatusCodes.OK) });
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        }
    } catch (err) {
        console.log("🚀 ~ file: busRoutes.js:189 ~ router.post ~ err:", err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "message": getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
});

router.post("/cancelSeat", async (req, res) => {
    if (!req.headers.authorization || !req.body.booking_id) {
        res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        return;
    }

    const decryptedToken = jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SECRET_KEY);
    if (!decryptedToken) {
        res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        return;
    }

    const customer_id = decryptedToken.used_id;

    try {
        const booking = await bookingModel.findOne({ _id: req.body.booking_id });
        if (booking) {
            if (booking.customer_id !== customer_id) {
                res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
                return;
            }
            const updatedBooking = await bookingModel.updateOne({ _id: req.body.booking_id }, { status: 2 });
            const updatedBus = await busModel.updateOne({ _id: booking.bus_id }, { $set: { [`occupied_seats.${booking.seat_id}`]: false } });
            res.status(StatusCodes.OK).json({ "message": getReasonPhrase(StatusCodes.OK) });
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        }
    } catch (err) {
        console.log("🚀 ~ file: busRoutes.js:189 ~ router.post ~ err:", err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "message": getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
});

module.exports = router;