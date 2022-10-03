/* What this snipped does?
** It simples convert a raw JSON to a formated TagoIO JSON while applying a parser for use with khomp devices.
** So if you send { "temperature": 10 }
** This script will convert it to { "variable": "temperature", "value": 10 }
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want. Not ready yet.
*/
// Add ignorable variables in this array.
const ignore_vars = [];


/**
 * Convert a khomp JSON object to TagoIO object format.
 * Can be used in two ways:
 * khompParser({ myvariable: myvalue , anothervariable: anothervalue... })
 * khompParser({ myvariable: { value: myvalue, unit: 'C', metadata: { color: 'green' }} , anothervariable: anothervalue... })
 *
 * @param {Object} object_item Object containing key and value.
 * @param {String} serie Serie for the variables
 * @param {String} prefix Add a prefix to the variables name
 */
function khompParser(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] == 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else if( key === 'n') {
      result.push({
        variable: object_item[key] || `${prefix}${key}`,
        value: Number(object_item['v']) || object_item['vs'].replace(/-/g,"_") || object_item['vb']?.toString(),
        serie,
      });
      return result[0];
    } else if( key === 'bn') {
      result.push({
        variable: object_item[key] || `${prefix}${key}`,
        value: object_item['bt'],
        serie,
      });
      return result[0];
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result[0];
}

payload = payload.map(
  item => {
    if(!item.variable){
      const serie = item.serie || new Date().getTime();
      return khompParser(item, serie);
    }
  return item;
  }
)
