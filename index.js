require('dotenv').config()

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async() => {
    let opt 
    const busquedas = new Busquedas()
    do {
        opt = await inquirerMenu()

        switch (opt) {
            case 1:
                //Mostrar mensaje
                const termino = await leerInput('Ciudad: ')
                
                //Buscar los lugares
                const lugares = await busquedas.ciudad( termino )
                
                // Seleccionar el lugar
                const id = await listarLugares(lugares)

                if (id === 0) continue

                const lugarSel = lugares[id-1]

                // Guardar en DB
                busquedas.agregarHistorial(`${ lugarSel.name }, ${ lugarSel.state } ${ lugarSel.country }`)

                // Clima
                const {lat, lon} = lugarSel
                const clima = await busquedas.climaLugar(lat,lon)

                //Mostrar resultados
                console.clear()
                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad:',`${ lugarSel.name }, ${ lugarSel.state } ${ lugarSel.country }`.green);
                console.log('Lat:',lugarSel.lat);
                console.log('Lng:',lugarSel.lon);
                console.log('Clima:', clima.desc.green);
                console.log('Temperatura:', clima.temp);
                console.log('Mínima:', clima.min);
                console.log('Máxima:', clima.max);
                
                break;
        
            case 2:
                busquedas.historialCapitalizado.forEach( (lugar,i) => {
                    const idx = `${i + 1}.`.green
                    console.log(`${idx} ${lugar}`);
                })
                break;

            default:
                break;
        }


        if( opt !== 0) await pausa()

    } while (opt !== 0);



}

main()