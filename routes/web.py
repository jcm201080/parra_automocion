from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from functools import wraps

web_bp = Blueprint('web', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('web.login'))
        return f(*args, **kwargs)
    return decorated_function

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

@web_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Validación con credenciales
        from models import AdminUser
        user = AdminUser.query.filter_by(username=username).first()
        if user and user.check_password(password):
            session['admin_logged_in'] = True
            session['username'] = user.username
            return redirect(url_for('web.admin'))
        else:
            flash('Usuario o contraseña incorrectos', 'error')
            
    return render_template('login.html')

@web_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('web.login'))

@web_bp.route('/admin')
@login_required
def admin():
    return render_template('admin.html')