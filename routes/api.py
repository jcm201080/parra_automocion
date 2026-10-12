from flask import Blueprint, request, jsonify
from models import db, Vehiculo

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/vehiculos', methods=['GET'])
def get_vehiculos():
    marca = request.args.get('marca', '')
    categoria = request.args.get('categoria', '')
    precio_max = request.args.get('precio_max', type=float)

    query = Vehiculo.query
    if marca:
        query = query.filter(Vehiculo.marca.ilike(f"%{marca}%"))
    if categoria and categoria != 'todos':
        query = query.filter(Vehiculo.categoria == categoria)
    if precio_max:
        query = query.filter(Vehiculo.precio <= precio_max)

    vehiculos = query.all()
    return jsonify([v.to_dict() for v in vehiculos])

@api_bp.route('/vehiculos', methods=['POST'])
def add_vehiculo():
    data = request.json
    nuevo = Vehiculo(
        marca=data['marca'],
        modelo=data['modelo'],
        categoria=data['categoria'],
        precio=float(data['precio']),
        anio=int(data['anio']),
        kilometros=int(data['kilometros']),
        combustible=data['combustible'],
        estado=data.get('estado', 'disponible'),
        imagen_url=data.get('imagen_url', ''),
        descripcion=data.get('descripcion', '')
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"message": "Vehículo añadido correctamente", "vehiculo": nuevo.to_dict()}), 201

@api_bp.route('/vehiculos/<int:id>', methods=['PUT'])
def update_vehiculo(id):
    v = Vehiculo.query.get_or_404(id)
    data = request.json
    v.marca = data.get('marca', v.marca)
    v.modelo = data.get('modelo', v.modelo)
    v.categoria = data.get('categoria', v.categoria)
    v.precio = float(data.get('precio', v.precio))
    v.estado = data.get('estado', v.estado)
    db.session.commit()
    return jsonify({"message": "Vehículo actualizado", "vehiculo": v.to_dict()})

@api_bp.route('/vehiculos/<int:id>', methods=['DELETE'])
def delete_vehiculo(id):
    v = Vehiculo.query.get_or_404(id)
    db.session.delete(v)
    db.session.commit()
    return jsonify({"message": "Vehículo eliminado"})