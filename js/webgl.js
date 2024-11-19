class WebGLDemo {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl');
        
        if (!this.gl) {
            alert('无法初始化 WebGL，您的浏览器可能不支持');
            return;
        }

        // 顶点着色器程序
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying lowp vec4 vColor;
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;

        // 片段着色器程序
        const fsSource = `
            varying lowp vec4 vColor;
            void main(void) {
                gl_FragColor = vColor;
            }
        `;

        // 初始化着色器程序
        const shaderProgram = this.initShaderProgram(vsSource, fsSource);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: this.gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };

        // 初始化缓冲区
        this.buffers = this.initBuffers();
        
        // 设置旋转角度
        this.rotation = 0.0;
        
        // 开始渲染
        this.render();
    }

    initBuffers() {
        // 创建立方体的顶点位置缓冲区
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

        const positions = [
            // 前面
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            // 后面
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,
            // 顶面
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,
            // 底面
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            // 右面
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,
            // 左面
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        ];

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        // 创建颜色缓冲区
        const colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);

        const faceColors = [
            [1.0, 0.0, 0.0, 1.0],    // 前面: 红色
            [0.0, 1.0, 0.0, 1.0],    // 后面: 绿色
            [0.0, 0.0, 1.0, 1.0],    // 顶面: 蓝色
            [1.0, 1.0, 0.0, 1.0],    // 底面: 黄色
            [1.0, 0.0, 1.0, 1.0],    // 右面: 紫色
            [0.0, 1.0, 1.0, 1.0],    // 左面: 青色
        ];

        let colors = [];
        for (let j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];
            colors = colors.concat(c, c, c, c);
        }

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);

        // 创建索引缓冲区
        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        const indices = [
            0,  1,  2,    0,  2,  3,    // 前面
            4,  5,  6,    4,  6,  7,    // 后面
            8,  9,  10,   8,  10, 11,   // 顶面
            12, 13, 14,   12, 14, 15,   // 底面
            16, 17, 18,   16, 18, 19,   // 右面
            20, 21, 22,   20, 22, 23,   // 左面
        ];

        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer,
        };
    }

    initShaderProgram(vsSource, fsSource) {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert('无法初始化着色器程序: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('编译着色器时发生错误: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    render() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const fieldOfView = 45 * Math.PI / 180;
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation, [0, 1, 0]);

        {
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
        }

        {
            const numComponents = 4;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
        }

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        this.gl.useProgram(this.programInfo.program);

        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        {
            const vertexCount = 36;
            const type = this.gl.UNSIGNED_SHORT;
            const offset = 0;
            this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
        }

        this.rotation += 0.01;
        requestAnimationFrame(this.render.bind(this));
    }
} 

// 添加页面切换时的初始化代码
document.addEventListener('DOMContentLoaded', function() {
    // 当切换到 WebGL 页面时初始化
    document.querySelector('[data-page="webgl"]').addEventListener('click', function() {
        // 确保只初始化一次
        if (!window.webglDemo) {
            window.webglDemo = new WebGLDemo('glcanvas');
        }
    });
});

function openWebGL() {
    const isGitHub = window.location.hostname.includes('github.io');
    const isRender = window.location.hostname.includes('onrender.com');
    
    if (isGitHub) {
        window.open(`${window.location.origin}/EasyTool/packaged_Navigation`, '_blank');
    } else if (isRender) {
        window.open(`${window.location.origin}/webgl`, '_blank');
    } else {
        // 本地环境
        window.open('http://localhost:8080/webgl', '_blank');
    }
} 