1. Lab Registration & Management
Description
Third-party staff register rural health centers/labs in the system so patients can discover available diagnostic services.
What happens here
Staff can:
•	Add new lab details
•	View registered labs
•	Update lab information
•	Remove or deactivate labs
Information stored:
•	Lab name
•	Address and district
•	Contact details
•	Operating hours
•	Status
Actors
•	Staff only
CRUD Operations
✔ Create lab
✔ Read lab details
✔ Update lab information
✔ Delete/deactivate lab

Add Status to find the lab is open , close for holidays.



2. Test Management per Lab
Description
Staff manage diagnostic tests available at each lab so patients can see available services.
What happens here
Staff can:
•	Add tests to labs
•	View tests in each lab
•	Update test information
•	Remove tests from labs
Test information includes:
•	Test name
•	Description
•	Price
•	Result time
Actors
•	Staff (CRUD)
•	Patients (Read only)
CRUD Operations
✔ Create test
✔ Read test details (Staff + Patient)
✔ Update test details
✔ Delete test
3. Test Availability control – staff control whether a test is currently available or unavailable at a lab.
4. test instruction – provide instructions to patients must follow before and after tests. Patients read instruction before vising labs.
•	Fasting requirements
•	Preparation steps
•	Post -test precautions
Crud operation.
✔ Create instructions
✔ Read instructions (Staff + Patient)
✔ Update instructions
✔ Delete instructions

5. Multi-Language Support
Description
Allows patients to view test and lab information in their native language.
What happens here
Staff can add translations for:
•	Test names
•	Instructions
•	Lab information
Patients switch language to understand details.
Languages example:
•	English
•	Sinhala
•	Tamil
Actors
•	Staff manage translations
•	Patients read translations
