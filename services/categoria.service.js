const CategoriaModel = require('../models/categoria.model');

class CategoriaService {

  async listarCategorias() {
    return await CategoriaModel.listarCategorias();
  }

  async listarCategoriasActivas() {
    return await CategoriaModel.listarCategoriasActivas();
  }

  async obtenerCategoriaPorId(id_categoria) {
    const categoria = await CategoriaModel.obtenerCategoriaPorId(id_categoria);
    if (!categoria) {
      throw new Error('Categoría no encontrada');
    }
    return categoria;
  }

  async crearCategoria(data) {
    const { descripcion } = data;
    
    const existe = await CategoriaModel.existeCategoriaPorDescripcion(descripcion);
    if (existe) {
      throw new Error('Ya existe una categoría con esa descripción');
    }
    
    const nuevoId = await CategoriaModel.crearCategoria(data);
    return { id_categoria: nuevoId, mensaje: 'Categoría creada correctamente' };
  }

  async actualizarCategoria(id_categoria, data) {
    const { descripcion } = data;
    
    const existe = await CategoriaModel.existeCategoriaPorDescripcion(descripcion, id_categoria);
    if (existe) {
      throw new Error('Ya existe otra categoría con esa descripción');
    }
    
    const affected = await CategoriaModel.actualizarCategoria(id_categoria, data);
    if (affected === 0) {
      throw new Error('Categoría no encontrada');
    }
    
    return { mensaje: 'Categoría actualizada correctamente' };
  }

  async cambiarEstado(id_categoria, activo) {
    const affected = await CategoriaModel.cambiarEstado(id_categoria, activo);
    if (affected === 0) {
      throw new Error('Categoría no encontrada');
    }
    return { mensaje: `Categoría ${activo === 'Si' ? 'activada' : 'desactivada'} correctamente` };
  }

  async eliminarCategoria(id_categoria) {
    const tieneProductos = await CategoriaModel.tieneProductosAsociados(id_categoria);
    if (tieneProductos) {
      throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
    }
    
    const affected = await CategoriaModel.eliminarCategoria(id_categoria);
    if (affected === 0) {
      throw new Error('Categoría no encontrada');
    }
    
    return { mensaje: 'Categoría eliminada correctamente' };
  }
}

module.exports = new CategoriaService();