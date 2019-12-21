
function fnDefault() {
    return "default function";
}

const STATIC_ONE = "one";

function getStaticOne() {
    return STATIC_ONE;
}

export default fnDefault;
export {
    fnDefault,
    STATIC_ONE,
    getStaticOne
}