// Booking controller
import { createBooking } from './booking.service.js';
import { createBookingValidation } from './booking.validation.js';

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