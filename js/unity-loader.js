class UnityLoader {
    constructor() {
        this.loaderUrl = 'packaged_Navigation/Build/packaged_Navigation.loader.js';
        this.config = {
            dataUrl: 'packaged_Navigation/Build/packaged_Navigation.data.unityweb',
            frameworkUrl: 'packaged_Navigation/Build/packaged_Navigation.framework.js.unityweb',
            codeUrl: 'packaged_Navigation/Build/packaged_Navigation.wasm.unityweb',
            streamingAssetsUrl: 'packaged_Navigation/StreamingAssets',
            companyName: 'DefaultCompany',
            productName: 'Navigation Demo',
            productVersion: '0.1',
        };
    }

    async load() {
        // 创建 Unity 实例
        const script = document.createElement('script');
        script.src = this.loaderUrl;
        script.onload = () => {
            createUnityInstance(document.querySelector('#unity-canvas'), this.config, (progress) => {
                const progressBarFull = document.querySelector('#unity-progress-bar-full');
                progressBarFull.style.width = `${100 * progress}%`;
            }).then((unityInstance) => {
                this.unityInstance = unityInstance;
                document.querySelector('#unity-loading-bar').style.display = 'none';
            }).catch((error) => {
                console.error('Unity 加载失败:', error);
            });
        };
        document.body.appendChild(script);
    }
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    const unityLoader = new UnityLoader();
    
    // 当切换到 WebGL 页面时加载 Unity
    document.querySelector('[data-page="webgl"]').addEventListener('click', function() {
        if (!window.unityInstance) {
            document.querySelector('#unity-loading-bar').style.display = 'block';
            unityLoader.load();
        }
    });
}); 