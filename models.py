from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Vehiculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    marca = db.Column(db.String(50), nullable=False)
    modelo = db.Column(db.String(50), nullable=False)
    categoria = db.Column(db.String(30), nullable=False)
    precio = db.Column(db.Float, nullable=False)
    anio = db.Column(db.Integer, nullable=False)
    kilometros = db.Column(db.Integer, nullable=False)
    combustible = db.Column(db.String(30), nullable=False)
    estado = db.Column(db.String(20), default='disponible')
    imagen_url = db.Column(db.String(255), nullable=True) # Imagen principal
    imagenes_galeria = db.Column(db.Text, nullable=True) # URLs separadas por coma
    descripcion = db.Column(db.Text, nullable=True)

    def to_dict(self):
        galeria_list = [img.strip() for img in self.imagenes_galeria.split(',')] if self.imagenes_galeria else []
        return {
            "id": self.id,
            "marca": self.marca,
            "modelo": self.modelo,
            "categoria": self.categoria,
            "precio": self.precio,
            "anio": self.anio,
            "kilometros": self.kilometros,
            "combustible": self.combustible,
            "estado": self.estado,
            "imagen_url": self.imagen_url or "https://via.placeholder.com/600x400?text=Parra+Automocion",
            "imagenes_galeria": galeria_list,
            "descripcion": self.descripcion
        }

class AdminUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)