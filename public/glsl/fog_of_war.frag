#ifdef GL_ES
precision highp float;
#endif

const int OBSERVER_MAX_AMOUNT = 64; // максимальное количество наблюдателей
const float VIEWING_MAX_RADIUS = 1024.; // максимальный радиус обзора
const float POOR_VISION_RADIUS = 0.5; // доля обзора, в которой восприятие в два раза хуже
const float ALPHA_THRESHOLD = 0.8; // все, что выше - препятствие, скрывающее обзор (отбрасывающее тень)

varying vec2 vTextureCoord; // текстурные координаты
uniform sampler2D uSampler; // карта препятствий
uniform vec4 inputSize;
uniform vec4 outputFrame;

uniform int uObserverAmount; // число наблюдателей
uniform vec2 uObserverPosList[OBSERVER_MAX_AMOUNT]; // список позиций наблюдателей
uniform float uObserverRadiusList[OBSERVER_MAX_AMOUNT]; // список радиусов обзора наблюдателей

uniform vec4 uShadowColor; // цвет тени


struct Observer {
    vec2 pos;
    float radius;
};

vec2 screenToTexPos(vec2 pixelPos) {
    return (pixelPos - outputFrame.xy) / inputSize.xy;
}


void main(void) {
    if (uObserverAmount == 0) {
        gl_FragColor = vec4(0, 0, 0, 1);
        return;
    }

    float shadowIntensity = 1.; // интенсивность тени (0 - тени нет совсем, 1 - полня тень)
    vec2 pixelPos = vTextureCoord * inputSize.xy + outputFrame.xy; // (screen-space) координаты пикселя

    // перебор источников света
    for(int i = 0; i < OBSERVER_MAX_AMOUNT; i++) {
        if (i >= uObserverAmount) {
            break;
        }

        // наблюдатель. имеет позицию и радиус обзора
        Observer observer = Observer(uObserverPosList[i], uObserverRadiusList[i]);

        float dist = distance(observer.pos, pixelPos); // (screen-space) расстояние до источника

        // пиксель будет виден,
        // если попадает в обхор наблюдателя и между ними нет препятствий
        // или если пиксель пренадлежит ближайшему к наблюдателю препятствию
        if (dist <= observer.radius) {
            bool isVisible = true; // пиксель видим?
            vec2 dir = normalize(observer.pos - pixelPos); // (screen-space) направление к наблюдателю

            // исходный пиксель либо в препятствии, либо на открытом пространстве
            bool isOpenSpace = texture2D(uSampler, vTextureCoord).a <= ALPHA_THRESHOLD;
            for(float j = 1.; j < VIEWING_MAX_RADIUS; j++) { // двигаемся по одному пикселю в сторону наблюдателя
                if (j >= dist) {
                    break;
                }
                // (uv-space) координаты пикселя с возможным препятствием
                vec2 nextCoord = screenToTexPos(pixelPos + dir * j); // координаты следующего к наблюдателю пикселя
                float nextAlpha = texture2D(uSampler, nextCoord).a; // препятствия не прозрачны
                if (nextAlpha > ALPHA_THRESHOLD) { // встретили пиксель препятсвия
                    // если для открытого пикселя встретилось препятствие
                    // или он пренадлежит второму препятствию, то пиксель невидим
                    if (isOpenSpace) {
                        isVisible = false;
                        break;
                    }
                } else {
                    isOpenSpace = true;
                }
            }

            if (isVisible) { // если пиксель видим, уменьшаем прозрачность тени
                // затухание у границ обзора
                float up = dist / observer.radius - POOR_VISION_RADIUS;
                float down = 1. - POOR_VISION_RADIUS;
                
                float fadingFactor = min(1. - up / down, 1.);
                shadowIntensity -= fadingFactor * fadingFactor;
            }
        }
    }

    shadowIntensity = max(shadowIntensity, 0.);
    gl_FragColor = vec4(uShadowColor.rgb, uShadowColor.a * shadowIntensity);
}
