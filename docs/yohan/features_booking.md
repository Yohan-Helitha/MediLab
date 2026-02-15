📅 2️⃣ Booking Management Component
📌 Description

The Booking Management Component handles the scheduling, queue management, and operational tracking of diagnostic test appointments. It allows patients to pre-book diagnostic tests or register as walk-ins while enabling staff to manage queues efficiently under rural healthcare constraints.

This component ensures controlled access to diagnostic services by enforcing availability rules, managing capacity, and tracking booking status from creation to completion.

🎯 Core Objectives

Allow patients to book diagnostic tests

Support walk-in registrations

Manage daily test capacity

Generate queue numbers

Track booking lifecycle

⚙️ Functional Capabilities
1. Pre-Booking System

Select health center

Select diagnostic test

Choose date

Generate queue number

Send confirmation notification

2. Walk-In Booking

Staff-assisted booking at lab

Immediate queue assignment

Real-time availability validation

3. Queue Management

Auto-generate queue numbers

Manage priority levels:

Normal

Elderly

Pregnant

Urgent

Track estimated waiting time

Mark booking as completed or cancelled

4. Capacity Control

Enforce daily capacity limits

Prevent overbooking

Adjust availability based on cancellations

5. Booking Status Lifecycle

Status transitions include:

Pending → Confirmed → Completed
            ↓
         Cancelled
            ↓
          No-Show

6. Safety Integration

Flag allergies or chronic conditions

Display medical warnings before confirmation

👥 Actors

Patients

Create booking

View status

Cancel booking

Staff

Create walk-in booking

Manage queue

Update booking status

🧠 Why This Component Is Important

Prevents overcrowding in rural labs

Supports both digital and physical patient flow

Ensures fair service through queue logic

Connects to result generation and notification system

🏗 Architectural Relationship Between Both Components
Health Center & Test Management
          ↓
Booking Management
          ↓
Test Result & Notification


The Health Center module defines availability.
The Booking module controls access.
The Result module completes the workflow.