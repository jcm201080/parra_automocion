from flask import Flask
from models import db, Vehiculo
from routes.web import web_bp
from routes.api import api_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'parra_automocion_secret_key_2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar Base de Datos con la App
db.init_app(app)

# Registrar Blueprints
app.register_blueprint(web_bp)
app.register_blueprint(api_bp)

# Datos iniciales
with app.app_context():
    db.create_all()
    if Vehiculo.query.count() == 0:
        v1 = Vehiculo(marca="Mitsubishi", modelo="Montero V40 2.8 TDI", categoria="4x4", precio=12500, anio=2001, kilometros=185000, combustible="Diésel", estado="disponible", descripcion="Preparación Offroad, snorkel, suspensión elevada y winche homologado.")
        v2 = Vehiculo(marca="Toyota", modelo="Land Cruiser KDJ120", categoria="4x4", precio=18900, anio=2007, kilometros=210000, combustible="Diésel", estado="disponible", descripcion="Tracción total, bloqueo de diferencial, revisión completa en taller Parra.")
        v3 = Vehiculo(marca="Volkswagen", modelo="Golf VII 2.0 TDI", categoria="Turismo", precio=14200, anio=2017, kilometros=115000, combustible="Diésel", estado="disponible", descripcion="Acabado Sport, pantalla táctil, sensores de aparcamiento y libro de mantenimiento.")
        db.session.add_all([v1, v2, v3])
        db.session.commit()

with app.app_context():
    db.create_all()
    from models import AdminUser
    if AdminUser.query.count() == 0:
        admin_user = AdminUser(username="admin")
        admin_user.set_password("parra2026")  # Cambia esta contraseña
        db.session.add(admin_user)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, port=5000)