from distutils.log import debug
from operator import truediv
from readline import read_init_file
from app import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)