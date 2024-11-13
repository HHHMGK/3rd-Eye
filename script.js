const impairments = [
    'Protanopia', 'Red-Blind', '#D10000',
    'Protanomaly', 'Red-Weak', '#FF6666',
    'Deuteranopia', 'Green-Blind', '#00A300',
    'Deuteranomaly', 'Green-Weak', '#66CC66',
    'Tritanopia', 'Blue-Blind', '#0000FF',
    'Tritanomaly', 'Blue-Weak', '#6699FF',
    'Achromatopsia', 'Monochromacy', '#000000',
    'Achromatomaly', 'Blue Cone Monochromacy', '#3333FF' 
];


num_slices = impairments.length/3;

for (let i = 0; i < num_slices; i++) {
    const slice = document.createElement('div');
    slice.classList.add('slice');
    slice.style = `--i: ${i}; --n: ${num_slices}; --c: ${impairments[i*3+2]}; `;
    slice.style.opacity = 0.85;
    slice.setAttribute('data-description', `${impairments[i*3]} ${impairments[i*3+1]}`);
    
    // Add event listeners
    slice.addEventListener('mouseover', function() {
        document.querySelector('.description').textContent = this.getAttribute('data-description');
    });
    slice.addEventListener('mouseout', function() {
        document.querySelector('.description').textContent = '';
    });

    document.querySelector('.pie').appendChild(slice);
}