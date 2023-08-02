const fs = require('fs')

const axios = require('axios')

class Busquedas {
    historial = []
    dbPath = './db/database.json'

    constructor() {
        // TODO leer DB si existe
        this.leerDB()
    }

    get historialCapitalizado() {
        return this.historial.map(ciudad => {
            return ciudad.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
        })
    }

    get paramsGeo() {
        return {
            'limit': 5,
            'appid': process.env.OPENWEATHER_KEY
        }
    }

    get paramsClima() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad( lugar = '' ){
        try {
            // peticion http
            const instance = axios.create({
                baseURL: `http://api.openweathermap.org/geo/1.0/direct?q=${lugar}`,
                params: this.paramsGeo
            })
            
            const resp = await instance.get()
            
            // console.log(resp.data);
            return resp.data.map( (lugar,i) => ({
                id: i+1,
                name: lugar.name,
                lat: lugar.lat,
                lon: lugar.lon,
                country: lugar.country,
                state: lugar.state || ''
            }))
            
        } catch (error) {
            return []
        }
    }

    async climaLugar( lat, lon ) {
        try {
            // instance axios.create({})
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsClima, lat, lon}
            })

            // resp.data
            const resp = await instance.get()
            const {main, weather} = resp.data

            // devolver datos
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }
    }


    agregarHistorial(lugar = '') {
        //prevenir duplicados
        if(this.historial.includes( lugar.toLocaleLowerCase() )){
            return
        }

        this.historial = this.historial.splice(0,5)
        this.historial.unshift(lugar.toLocaleLowerCase())

        // Grabar en DB
        this.guardarDB()
    }

    guardarDB(){

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify(payload))
    }

    leerDB(){
        // Debe de existir...
        if( !fs.existsSync( this.dbPath )) {
            return
        }

        const info = fs.readFileSync(this.dbPath,{encoding: 'utf-8'})
        const data = JSON.parse(info)
        
        this.historial = data.historial
    }


}

module.exports = Busquedas