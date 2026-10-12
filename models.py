from flask_sqlalchemy import SQLAlchemy

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
    imagen_url = db.Column(db.String(255), nullable=True)
    descripcion = db.Column(db.Text, nullable=True)

    def to_dict(self):
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
            "descripcion": self.descripcion
        }