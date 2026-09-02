"""
AI 职业导航与终身学习伙伴系统 - 后端服务
基于 Flask 框架搭建基础 API 服务
"""

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# 前端静态文件目录
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')


@app.route('/')
def index():
    """返回前端首页"""
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    """提供前端静态文件"""
    return send_from_directory(FRONTEND_DIR, filename)


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'ok',
        'message': 'AI 职业导航系统服务运行正常',
        'version': '0.1.0'
    })


@app.route('/api/info', methods=['GET'])
def system_info():
    """系统信息接口"""
    return jsonify({
        'name': 'AI 职业导航与终身学习伙伴',
        'description': '面向未来工作的 AI 职业导航系统',
        'features': [
            '动态职业画像构建',
            '个性化学习路径生成',
            '职场场景模拟训练',
            '成长轨迹可视化',
            '多端发布支持'
        ],
        'tech_stack': {
            'backend': 'Python Flask',
            'frontend': 'HTML + CSS + JavaScript',
            'platform': '蚂蚁百宝箱企业版'
        }
    })


if __name__ == '__main__':
    print("=" * 50)
    print("  AI 职业导航系统 - 开发服务器")
    print("  访问地址: http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
