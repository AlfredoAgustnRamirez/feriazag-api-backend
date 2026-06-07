const ClienteModel = require('../models/cliente.model');

class ClienteService {
    async listarClientes(estado) {
        return await ClienteModel.listar(estado);
    }

    async buscarClientes(search) {
        if (!search || search.trim() === '') {
            return [];
        }
        return await ClienteModel.buscar(search);
    }

    async obtenerClientePorId(id_cliente) {
        const cliente = await ClienteModel.obtenerPorId(id_cliente);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        return cliente;
    }

    async crearCliente(data) {
        const { dni_cuit } = data;
        
        const existe = await ClienteModel.existeDNI(dni_cuit);
        if (existe) {
            throw new Error('Ya existe un cliente con ese DNI/CUIT');
        }
        
        const resultado = await ClienteModel.crear(data);
        return { 
            id_cliente: resultado.id_cliente, 
            mensaje: 'Cliente creado correctamente' 
        };
    }

    async actualizarCliente(id_cliente, data) {
        const { dni_cuit } = data;
        
        const clienteExiste = await ClienteModel.obtenerPorId(id_cliente);
        if (!clienteExiste) {
            throw new Error('Cliente no encontrado');
        }
        
        const existeDNI = await ClienteModel.existeDNI(dni_cuit, id_cliente);
        if (existeDNI) {
            throw new Error('Ya existe otro cliente con ese DNI/CUIT');
        }
        
        const actualizado = await ClienteModel.actualizar(id_cliente, data);
        if (actualizado === 0) {
            throw new Error('No se pudo actualizar el cliente');
        }
        
        return { mensaje: 'Cliente actualizado correctamente' };
    }

    async cambiarEstado(id_cliente, activo) {
        const clienteExiste = await ClienteModel.obtenerPorId(id_cliente);
        if (!clienteExiste) {
            throw new Error('Cliente no encontrado');
        }
        
        const actualizado = await ClienteModel.cambiarEstado(id_cliente, activo);
        if (actualizado === 0) {
            throw new Error('No se pudo cambiar el estado del cliente');
        }
        
        const mensaje = activo === 'SI' ? 'Cliente activado correctamente' : 'Cliente desactivado correctamente';
        return { mensaje };
    }

    async eliminarCliente(id_cliente) {
        const clienteExiste = await ClienteModel.obtenerPorId(id_cliente);
        if (!clienteExiste) {
            throw new Error('Cliente no encontrado');
        }
        
        const tieneVentas = await ClienteModel.tieneVentas(id_cliente);
        if (tieneVentas) {
            throw new Error('No se puede eliminar el cliente porque tiene ventas asociadas');
        }
        
        const eliminado = await ClienteModel.eliminar(id_cliente);
        if (eliminado === 0) {
            throw new Error('No se pudo eliminar el cliente');
        }
        
        return { mensaje: 'Cliente eliminado correctamente' };
    }

    async listarTiposCliente() {
        return await ClienteModel.listarTipos();
    }
}

module.exports = new ClienteService();