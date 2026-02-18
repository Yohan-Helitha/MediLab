// Booking controller
import { validationResult } from 'express-validator';
import { createBooking, getBookings as getBookingsService } from './booking.service.js';

export const createBookingController = async (req, res) => {

    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const booking = await createBooking(req.body, req.user.id);
        res.status(201).json({
            message: 'Booking created successfully',
            booking

        });

    } catch (error) {
        console.error('Error creating booking:', error);
        return res.status(400).json({
            message: error.message
        });

    }

};

export const getBookings = async (req, res) => {

    try {
        
        const bookings = await getBookingsService({});
        res.json({
            message: 'Bookings fetched successfully',
            bookings
        });


    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(400).json({
            message: error.message
        });
    }

}

export const getBookingByPatientId = async (req, res) => {

    try {
        
        const bookings = await getBookingsService({ patientProfileId: req.params.patientProfileId });
        res.json({
            message: 'Bookings fetched successfully',
            bookings
        });

    } catch (error) {
        console.error('Error fetching booking by patient ID:', error);
        return res.status(400).json({
            message: error.message
        });
    }

}

export const getBookingByHealthCenterId = async (req, res) => {

    try {
        
        const bookings = await getBookingsService({ healthCenterId: req.params.healthCenterId });
        res.json({
            message: 'Bookings fetched successfully',
            bookings
        });

    } catch (error) {
        console.error('Error fetching booking by health center ID:', error);
        return res.status(400).json({
            message: error.message
        });
    }

}

export const getBookingByDate = async (req, res) => {

    try {
        
        const bookings = await getBookingsService({ bookingDate: new Date(req.params.bookingDate) });
        res.json({
            message: 'Bookings fetched successfully',
            bookings
        });

    } catch (error) {
        console.error('Error fetching booking by date:', error);
        return res.status(400).json({
            message: error.message
        });
    }

}

export const getBookingByCreatedBy = async (req, res) => {

    try {
        
        const bookings = await getBookingsService({ createdBy: req.params.createdBy });
        res.json({
            message: 'Bookings fetched successfully',
            bookings
        });

    } catch (error) {
        console.error('Error fetching booking by created by:', error);
        return res.status(400).json({
            message: error.message
        });
    }

}

export const getBookingByStatus = async (req, res) => {

    try {
        
        const bookings = await getBookingsService({ status: req.params.status });
        res.json({
            message: 'Bookings fetched successfully',
            bookings
        });

    } catch (error) {
        console.error('Error fetching booking by status:', error);
        return res.status(400).json({
            message: error.message
        });
    }

}

export const getBookingByType = async (req, res) => {

    try {
        
        const bookings = await getBookingsService({ bookingType: req.params.type });
        res.json({
            message: 'Bookings fetched successfully',
            bookings
        });

    } catch (error) {
        console.error('Error fetching booking by type:', error);
        return res.status(400).json({
            message: error.message
        });
    }


}

