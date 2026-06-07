const ClienteService = require('../services/cliente.service');
const { validationResult } = require('express-validator');

class ClienteController {

    async listarClientes(req, res, next) {
        try {
            const { estado } = req.query;
            const clientes = await ClienteService.listarClientes(estado);
            res.json(clientes);
        } catch (error) {
            next(error);
        }
    }

    async buscarClientes(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            const { search } = req.query;
            const clientes = await ClienteService.buscarClientes(search);
            res.json(clientes);
        } catch (error) {
            next(error);
        }
    }

    async obtenerClientePorId(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            const { id_cliente } = req.params;
            const cliente = await ClienteService.obtenerClientePorId(id_cliente);
            res.json(cliente);
        } catch (error) {
            next(error);
        }
    }

    async crearCliente(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            const resultado = await ClienteService.crearCliente(req.body);
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async actualizarCliente(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            const { id_cliente } = req.params;
            const resultado = await ClienteService.actualizarCliente(id_cliente, req.body);
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async cambiarEstado(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            const { id_cliente } = req.params;
            const { activo } = req.body;
            const resultado = await ClienteService.cambiarEstado(id_cliente, activo);
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async eliminarCliente(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            const { id_cliente } = req.params;
            const resultado = await ClienteService.eliminarCliente(id_cliente);
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async listarTiposCliente(req, res, next) {
        try {
            const tipos = await ClienteService.listarTiposCliente();
            res.json(tipos);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ClienteController();