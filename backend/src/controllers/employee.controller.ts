import { Request, Response } from 'express';
import { Employee } from '../models/employee.model';

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { tradeId, email } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ tradeId }, { email }],
    });

    if (existingEmployee) {
      if (existingEmployee.tradeId === tradeId) {
        return res.status(400).json({
          message: 'Employee with this Trade ID already exists',
        });
      }
      if (existingEmployee.email === email) {
        return res.status(400).json({
          message: 'Employee with this email already exists',
        });
      }
    }

    // Create new employee
    const employee = new Employee(req.body);
    await employee.save();

    res.status(201).json({
      message: 'Employee created successfully',
      employee,
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      message: 'Error creating employee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      site,
      status,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter: any = {};

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { tradeId: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) filter.department = department;
    if (site) filter.site = site;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Employee.countDocuments(filter),
    ]);

    res.json({
      employees,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      message: 'Error fetching employees',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      message: 'Error fetching employee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    // Check for duplicate tradeId or email if they're being updated
    if (req.body.tradeId || req.body.email) {
      const duplicateCheck = await Employee.findOne({
        _id: { $ne: id },
        $or: [
          ...(req.body.tradeId ? [{ tradeId: req.body.tradeId }] : []),
          ...(req.body.email ? [{ email: req.body.email }] : []),
        ],
      });

      if (duplicateCheck) {
        if (duplicateCheck.tradeId === req.body.tradeId) {
          return res.status(400).json({
            message: 'Another employee with this Trade ID already exists',
          });
        }
        if (duplicateCheck.email === req.body.email) {
          return res.status(400).json({
            message: 'Another employee with this email already exists',
          });
        }
      }
    }

    Object.assign(employee, req.body);
    await employee.save();

    res.json({
      message: 'Employee updated successfully',
      employee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      message: 'Error updating employee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    res.json({
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      message: 'Error deleting employee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getEmployeeStats = async (req: Request, res: Response) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      departmentStats,
      siteStats,
      recentJoinings,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Employee.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Employee.aggregate([
        { $group: { _id: '$site', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Employee.find()
        .sort({ dateOfJoining: -1 })
        .limit(5)
        .select('employeeName tradeId department dateOfJoining'),
    ]);

    res.json({
      stats: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
        byDepartment: departmentStats,
        bySite: siteStats,
        recentJoinings,
      },
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      message: 'Error fetching employee statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
