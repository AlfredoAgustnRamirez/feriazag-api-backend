const ClienteModel = require('../models/cliente.model');

class ClienteService {

  async listarClientes(estado) {
    return await ClienteModel.listarClientes(estado);
  }

  async buscarClientes(search) {
    if (!search || search.trim() === '') {
      return await ClienteModel.listarClientes();
    }
    return await ClienteModel.buscarClientes(search);
  }

  async obtenerClientePorId(id_cliente) {
    const cliente = await ClienteModel.obtenerClientePorId(id_cliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }
    return cliente;
  }

  async crearCliente(data) {
    const { dni_cuit } = data;
    
    const existe = await ClienteModel.existeClientePorDni(dni_cuit);
    if (existe) {
      throw new Error('Ya existe un cliente con ese DNI/CUIT');
    }
    
    const nuevoId = await ClienteModel.crearCliente(data);
    return { id_cliente: nuevoId, mensaje: 'Cliente creado correctamente' };
  }

  async actualizarCliente(id_cliente, data) {
    const { dni_cuit } = data;
    
    const existe = await ClienteModel.existeClientePorDni(dni_cuit, id_cliente);
    if (existe) {
      throw new Error('Ya existe otro cliente con ese DNI/CUIT');
    }
    
    const affected = await ClienteModel.actualizarCliente(id_cliente, data);
    if (affected === 0) {
      throw new Error('Cliente no encontrado');
    }
    
    return { mensaje: 'Cliente actualizado correctamente' };
  }

  async cambiarEstado(id_cliente, activo) {
    const affected = await ClienteModel.cambiarEstado(id_cliente, activo);
    if (affected === 0) {
      throw new Error('Cliente no encontrado');
    }
    return { mensaje: `Cliente ${activo === 'SI' ? 'activado' : 'desactivado'} correctamente` };
  }

  async eliminarCliente(id_cliente) {
    const tieneVentas = await ClienteModel.tieneVentasAsociadas(id_cliente);
    if (tieneVentas) {
      throw new Error('No se puede eliminar el cliente porque tiene ventas asociadas');
    }
    
    const affected = await ClienteModel.eliminarCliente(id_cliente);
    if (affected === 0) {
      throw new Error('Cliente no encontrado');
    }
    
    return { mensaje: 'Cliente eliminado correctamente' };
  }

  async listarTiposCliente() {
    return await ClienteModel.listarTiposCliente();
  }
}

module.exports = new ClienteService();