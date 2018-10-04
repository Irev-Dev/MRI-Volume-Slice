console.log('Stub created.');

   // timing
console.time('fetching data');
try {
    
    // fetch('https://api.osf.io/v2/nodes', {
    // fetch('https://openfmri.org/dataset/api/', {
    //         "method": "GET",
    //         "Content-Type": "application/vnd.api+json",
    //         "mode": "cors",
    //         "Access-Control-Allow-Origin": "https://api.osf.io"
    //     })
    fetch('https://openfmri.org/dataset/api/')
    // fetch('https://api.github.com/users/wesbos')
        .then((data, err) => {
            console.log(data);
            // console.log(err);
            return data.json();
        })
        .then(data => {
        console.timeEnd('fetching data');
        console.log(data);
        });
} catch (error) {
    // console.log(error);
    
}