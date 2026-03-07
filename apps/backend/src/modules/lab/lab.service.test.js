import Lab, { saveMock } from './lab.model.js';
import * as labService from './lab.service.js';

// Mock the Lab model for all tests in this file
jest.mock('./lab.model.js', () => {
  const saveMockLocal = jest.fn();

  const LabMock = jest.fn().mockImplementation(() => ({
    save: saveMockLocal,
  }));

  LabMock.find = jest.fn();
  LabMock.findById = jest.fn();
  LabMock.findByIdAndUpdate = jest.fn();
  LabMock.findByIdAndDelete = jest.fn();

  return {
    __esModule: true,
    default: LabMock,
    saveMock: saveMockLocal,
  };
});

describe('lab.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createLab should create and save a lab', async () => {
    const labData = { name: 'Central Lab', district: 'Colombo' };
    const savedLab = { _id: 'lab123', ...labData };

    // saveMock is provided by our jest.mock factory
    saveMock.mockResolvedValue(savedLab);

    const result = await labService.createLab(labData);

    // Lab constructor called with provided data
    expect(Lab).toHaveBeenCalledWith(labData);
    // save called once and result returned
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(savedLab);
  });

  it('getLabs should call Lab.find with empty query when no filter', async () => {
    const allLabs = [{ name: 'Lab A' }, { name: 'Lab B' }];
    Lab.find.mockResolvedValue(allLabs);

    const result = await labService.getLabs();

    expect(Lab.find).toHaveBeenCalledWith({});
    expect(result).toBe(allLabs);
  });

  it('getLabs should build a case-insensitive name filter', async () => {
    const labs = [{ name: 'Central Lab' }];
    Lab.find.mockResolvedValue(labs);

    const result = await labService.getLabs({ name: 'central' });

    expect(Lab.find).toHaveBeenCalledWith({
      name: { $regex: 'central', $options: 'i' },
    });
    expect(result).toBe(labs);
  });

  it('getLabById should delegate to Lab.findById', async () => {
    const lab = { _id: 'lab123', name: 'Central Lab' };
    Lab.findById.mockResolvedValue(lab);

    const result = await labService.getLabById('lab123');

    expect(Lab.findById).toHaveBeenCalledWith('lab123');
    expect(result).toBe(lab);
  });

  it('updateLab should call findByIdAndUpdate with new:true', async () => {
    const updated = { _id: 'lab123', name: 'Updated Lab' };
    Lab.findByIdAndUpdate.mockResolvedValue(updated);

    const result = await labService.updateLab('lab123', { name: 'Updated Lab' });

    expect(Lab.findByIdAndUpdate).toHaveBeenCalledWith('lab123', { name: 'Updated Lab' }, { new: true });
    expect(result).toBe(updated);
  });

  it('deleteLab should call findByIdAndDelete', async () => {
    const deleted = { _id: 'lab123' };
    Lab.findByIdAndDelete.mockResolvedValue(deleted);

    const result = await labService.deleteLab('lab123');

    expect(Lab.findByIdAndDelete).toHaveBeenCalledWith('lab123');
    expect(result).toBe(deleted);
  });

  it('updateLabStatus should update operationalStatus field', async () => {
    const updated = { _id: 'lab123', operationalStatus: 'OPEN' };
    Lab.findByIdAndUpdate.mockResolvedValue(updated);

    const result = await labService.updateLabStatus('lab123', 'OPEN');

    expect(Lab.findByIdAndUpdate).toHaveBeenCalledWith(
      'lab123',
      { operationalStatus: 'OPEN' },
      { new: true },
    );
    expect(result).toBe(updated);
  });
});
