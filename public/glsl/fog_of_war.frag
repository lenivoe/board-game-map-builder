#ifdef GL_ES
precision highp float;
#endif

const int OBSERVER_MAX_AMOUNT = 32; // максимальное количество наблюдателей
const float VIEWING_MAX_RADIUS = 1024.; // максимальный радиус обзора
const float ALPHA_THRESHOLD = 0.9; // все, что выше - препятствие, скрывающее обзор (отбрасывающее тень)

varying vec2 vTextureCoord; // текстурные координаты
uniform sampler2D uSampler; // карта препятствий
uniform vec4 inputSize;
uniform vec4 outputFrame;

uniform int uObserverAmount; // число наблюдателей
uniform vec2 uObserverPosList[OBSERVER_MAX_AMOUNT]; // список позиций наблюдателей
uniform float uObserverRadiusList[OBSERVER_MAX_AMOUNT]; // список радиусов обзора наблюдателей

uniform sampler2D uBarrierTex; // карта препятствий


struct Observer {
    vec2 pos;
    float radius;
};

vec2 screenToTexPos(vec2 pixelPos) {
    return (pixelPos - outputFrame.xy) / inputSize.xy;
}

bool isBarrier(vec2 texCoord) {
    vec2 coord = texCoord / (outputFrame.zw * inputSize.zw);
    return texture2D(uBarrierTex, coord).a > ALPHA_THRESHOLD;
}


void main(void) {
    if (uObserverAmount == 0) {
        gl_FragColor = vec4(0);
        return;
    }

    float shadowIntensity = 1.; // интенсивность тени (0 - тени нет совсем, 1 - полня тень)
    vec2 pixelPos = vTextureCoord * inputSize.xy + outputFrame.xy; // (screen-space) координаты пикселя

    // перебор наблюдателей
    for(int i = 0; i < OBSERVER_MAX_AMOUNT; i++) {
        if (i >= uObserverAmount) {
            break;
        }

        Observer observer = Observer(uObserverPosList[i], uObserverRadiusList[i]);

        float dist = distance(observer.pos, pixelPos); // (screen-space) расстояние до источника
        
        // пиксель будет виден,
        // если попадает в обхор наблюдателя и между ними нет препятствий
        // или если пиксель пренадлежит ближайшему к наблюдателю препятствию
        if (dist <= observer.radius) {
            bool isVisible = true; // пиксель видим?
            vec2 dir = normalize(observer.pos - pixelPos); // (screen-space) направление к наблюдателю

            // исходный пиксель либо в препятствии, либо на открытом пространстве
            bool isOpenSpace = !isBarrier(vTextureCoord);
            for(float j = 1.; j < VIEWING_MAX_RADIUS; j+=2.) { // двигаемся по одному пикселю в сторону наблюдателя
                if (j >= dist) {
                    break;
                }
                // (uv-space) координаты пикселя с возможным препятствием
                vec2 nextCoord = screenToTexPos(pixelPos + dir * j); // координаты следующего к наблюдателю пикселя
                if (isBarrier(nextCoord)) { // встретили пиксель препятсвия
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

            if (isVisible) { // если пиксель видим, убираем тень
                shadowIntensity = 0.;
                break;
            }
        }
    }
    gl_FragColor = vec4(1. - shadowIntensity);
}
