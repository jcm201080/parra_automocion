from flask import Blueprint, render_template, request

web_bp = Blueprint('web', __name__)

@web_bp.route('/')
def index():
    return render_template('index.html')

@web_bp.route('/catalogo')
def catalogo():
    categoria = request.args.get('cat', 'todos')
    return render_template('catalogo.html', categoria_inicial=categoria)

@web_bp.route('/taller')
def taller():
    return render_template('taller.html')

@web_bp.route('/contacto')
def contacto():
    return render_template('contacto.html')

@web_bp.route('/admin')
def admin():
    return render_template('admin.html')