import * as adminRepository from '../database/repositories/admin.repository.js';

export async function getStats(req, res, next) {
  try {
    const stats = await adminRepository.getSystemStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const result = await adminRepository.getUsers({
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 50, 100),
      search,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await adminRepository.getUser(req.params.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function setUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "user" or "admin"' });
    }
    const profile = await adminRepository.updateUserRole(req.params.userId, role);
    res.json({ user: profile });
  } catch (error) {
    next(error);
  }
}

export async function removeUser(req, res, next) {
  try {
    await adminRepository.deleteUser(req.params.userId);
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}
