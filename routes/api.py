import os
import uuid
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import secure_filename
from models import db, Vehiculo

api_bp = Blueprint('api', __name__, url_prefix='/api')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api_bp.route('/upload', methods=['POST'])
def upload_file():
    if not session.get('admin_logged_in'):
        return jsonify({"error": "No autorizado"}), 401
        
    if 'foto' not in request.files:
        return jsonify({"error": "No se ha enviado ningún archivo"}), 400
        
    file = request.files['foto']
    if file.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400
        
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        file_url = f"/static/uploads/{filename}"
        return jsonify({"url": file_url}), 200
        
    return jsonify({"error": "Formato de imagen no permitido"}), 400

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
    if not session.get('admin_logged_in'):
        return jsonify({"error": "No autorizado"}), 401
        
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
        imagenes_galeria=data.get('imagenes_galeria', ''),
        descripcion=data.get('descripcion', '')
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"message": "Vehículo añadido correctamente", "vehiculo": nuevo.to_dict()}), 201

@api_bp.route('/vehiculos/<int:id>', methods=['PUT'])
def update_vehiculo(id):
    if not session.get('admin_logged_in'):
        return jsonify({"error": "No autorizado"}), 401
        
    v = Vehiculo.query.get_or_404(id)
    data = request.json
    v.marca = data.get('marca', v.marca)
    v.modelo = data.get('modelo', v.modelo)
    v.categoria = data.get('categoria', v.categoria)
    v.precio = float(data.get('precio', v.precio))
    v.estado = data.get('estado', v.estado)
    v.imagen_url = data.get('imagen_url', v.imagen_url)
    v.imagenes_galeria = data.get('imagenes_galeria', v.imagenes_galeria)
    db.session.commit()
    return jsonify({"message": "Vehículo actualizado", "vehiculo": v.to_dict()})

@api_bp.route('/vehiculos/<int:id>', methods=['DELETE'])
def delete_vehiculo(id):
    if not session.get('admin_logged_in'):
        return jsonify({"error": "No autorizado"}), 401
        
    v = Vehiculo.query.get_or_404(id)
    db.session.delete(v)
    db.session.commit()
    return jsonify({"message": "Vehículo eliminado"})

@api_bp.route('/upload-multiple', methods=['POST'])
def upload_multiple():
    if not session.get('admin_logged_in'):
        return jsonify({"error": "No autorizado"}), 401
        
    if 'fotos' not in request.files:
        return jsonify({"error": "No se han recibido archivos"}), 400
        
    files = request.files.getlist('fotos')
    saved_urls = []
    
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    
    for file in files:
        if file and file.filename != '' and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            saved_urls.append(f"/static/uploads/{filename}")
            
    if saved_urls:
        return jsonify({"urls": saved_urls}), 200
        
    return jsonify({"error": "Formato de archivo no permitido"}), 400