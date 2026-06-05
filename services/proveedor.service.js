const ProveedorModel = require('../models/proveedor.model');

class ProveedorService {

  async crearProveedor(data) {
    const nuevoId = await ProveedorModel.crearProveedor(data);
    return { id_proveedor: nuevoId, mensaje: 'Proveedor creado correctamente' };
  }

  async actualizarProveedor(id_proveedor, data) {
    await ProveedorModel.actualizarProveedor(id_proveedor, data);
    return { mensaje: 'Proveedor actualizado correctamente' };
  }

  async listarProveedores() {
    return await ProveedorModel.listarProveedores();
  }

  async listarActivos() {
    return await ProveedorModel.listarActivos();
  }

  async obtenerProveedorPorId(id_proveedor) {
    const proveedor = await ProveedorModel.obtenerProveedorPorId(id_proveedor);
    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }
    return proveedor;
  }

  async cambiarEstado(id_proveedor, activo) {
    if (!activo || !['Si', 'No'].includes(activo)) {
      throw new Error('Estado inválido. Use "Si" o "No"');
    }
    
    const affected = await ProveedorModel.cambiarEstado(id_proveedor, activo);
    if (affected === 0) {
      throw new Error('Proveedor no encontrado');
    }
    
    return { 
      mensaje: `Proveedor ${activo === 'Si' ? 'activado' : 'desactivado'} correctamente` 
    };
  }

  async eliminarProveedor(id_proveedor) {
    const affected = await ProveedorModel.eliminarProveedor(id_proveedor);
    if (affected === 0) {
      throw new Error('Proveedor no encontrado');
    }
    return { mensaje: 'Proveedor eliminado correctamente' };
  }
}

module.exports = new ProveedorService();