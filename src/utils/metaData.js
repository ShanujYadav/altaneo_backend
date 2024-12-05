import moment from "moment"


const YMD = () => {
    return moment().format('YYYYMMDD')
}
export const ymd = YMD()


export const ts = () => {
    return moment().format('YYYY-MM-DD  h:mm:ss')
}