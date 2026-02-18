const labService = require('./lab.service');

// Create a new lab
async function createLab(req, res) {
  try {
    const lab = await labService.createLab(req.body);
    res.status(201).json(lab);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all labs (with optional name filter)
async function getLabs(req, res) {
  try {
    const filter = {};
    if (req.query.name) {
      filter.name = req.query.name;
    }
    const labs = await labService.getLabs(filter);
    res.json(labs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get a single lab by ID
async function getLabById(req, res) {
  try {
    const lab = await labService.getLabById(req.params.id);
    if (!lab) return res.status(404).json({ error: 'Lab not found' });
    res.json(lab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update lab details
async function updateLab(req, res) {
  try {
    const lab = await labService.updateLab(req.params.id, req.body);
    if (!lab) return res.status(404).json({ error: 'Lab not found' });
    res.json(lab);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Delete a lab (hard delete)
async function deleteLab(req, res) {
  try {
    const lab = await labService.deleteLab(req.params.id);
    if (!lab) return res.status(404).json({ error: 'Lab not found' });
    res.json({ message: 'Lab deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update lab status (soft delete/activate)
async function updateLabStatus(req, res) {
  try {
    const { status } = req.body;
    const lab = await labService.updateLabStatus(req.params.id, status);
    if (!lab) return res.status(404).json({ error: 'Lab not found' });
    res.json(lab);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  createLab,
  getLabs,
  getLabById,
  updateLab,
  deleteLab,
  updateLabStatus,
};
