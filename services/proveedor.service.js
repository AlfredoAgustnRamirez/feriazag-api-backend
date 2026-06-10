const ProveedorModel = require('../models/proveedor.model');

class ProveedorService {

  async crearProveedor(data) {
    const { cuit, nombre, telefono, email, direccion, contacto } = data;
    if (cuit) {
        const existente = await ProveedorModel.findByCuit(cuit);
        if (existente) {
            throw new Error(`Ya existe un proveedor con el CUIT ${cuit}`);
        }
    }
    const id = await ProveedorModel.crearProveedor(data);
    return { id, mensaje: 'Proveedor creado correctamente' };
}

  async actualizarProveedor(id_proveedor, data) {
     const { cuit } = data;
    if (cuit) {
        const existente = await ProveedorModel.findByCuitExcludingId(cuit, id_proveedor);
        if (existente) {
            throw new Error(`Ya existe otro proveedor con el CUIT ${cuit}`);
        }
    }
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
  if (activo === 'No') {
    const tieneCompras = await ProveedorModel.tieneOrdenesCompra(id_proveedor);
    if (tieneCompras) {
      throw new Error('No se puede desactivar el proveedor porque tiene órdenes de compra asociadas');
    }
  }
  
  const resultado = await ProveedorModel.cambiarEstado(id_proveedor, activo);
  return resultado;
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