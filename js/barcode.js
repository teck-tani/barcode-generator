let barcodeCount = 0;
const maxBarcodes = 50;

function generateBarcode(value, type, container) {
    try {
        let options = {
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 20,
            textMargin: 10,
            margin: 10
        };

        // Add specific options for different barcode types
        switch(type) {
            case 'EAN':
                options.format = 'EAN13';
                options.flat = true;
                break;
            case 'EAN8':
                options.format = 'EAN8';
                options.flat = true;
                break;
            case 'UPC':
                options.format = 'UPC';
                options.flat = true;
                break;
            case 'CODE39':
                options.flat = true;
                break;
            case 'ITF14':
            case 'ITF':
                options.flat = true;
                break;
            case 'MSI':
            case 'MSI10':
            case 'MSI11':
            case 'MSI1010':
            case 'MSI1110':
                break;
            case 'Pharmacode':
                break;
        }

        JsBarcode(container, value, options);
    } catch (error) {
        document.getElementById('error').textContent = `Error: ${error.message}`;
    }
}

function addBarcode() {
    const type = document.getElementById('barcodeType').value;
    let value = document.getElementById('barcodeValue').value;
    const errorDiv = document.getElementById('error');
    const barcodeInput = document.getElementById('barcodeValue');
    
    if (!value) {
        errorDiv.textContent = '바코드 값을 입력해주세요';
        return;
    }

    // Validate barcode format
    if (type === 'EAN' || type === 'EAN8') {
        const numericValue = value.replace(/\D/g, '');
        if (type === 'EAN' && (numericValue.length !== 12 && numericValue.length !== 13)) {
            errorDiv.textContent = 'EAN 바코드는 12자리 또는 13자리 숫자여야 합니다';
            return;
        }
        if (type === 'EAN8' && (numericValue.length !== 7 && numericValue.length !== 8)) {
            errorDiv.textContent = 'EAN-8 바코드는 7자리 또는 8자리 숫자여야 합니다';
            return;
        }
        value = numericValue;
    } else if (type === 'UPC') {
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length !== 11 && numericValue.length !== 12) {
            errorDiv.textContent = 'UPC 바코드는 11자리 또는 12자리 숫자여야 합니다';
            return;
        }
        value = numericValue;
    }

    if (barcodeCount >= maxBarcodes) {
        errorDiv.textContent = `최대 바코드 개수 (${maxBarcodes}개)에 도달했습니다`;
        return;
    }

    errorDiv.textContent = '';
    barcodeCount++;

    const grid = document.getElementById('barcodeGrid');
    const barcodeItem = document.createElement('div');
    barcodeItem.className = 'barcode-item';
    barcodeItem.draggable = true;
    
    // Add drag event listeners
    barcodeItem.addEventListener('dragstart', handleDragStart);
    barcodeItem.addEventListener('dragend', handleDragEnd);
    barcodeItem.addEventListener('dragover', handleDragOver);
    barcodeItem.addEventListener('drop', handleDrop);
    
    const barcodeNumber = document.createElement('div');
    barcodeNumber.className = 'barcode-number';
    barcodeNumber.textContent = barcodeCount;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-barcode';
    removeButton.textContent = '×';
    removeButton.onclick = function() {
        barcodeItem.remove();
        barcodeCount--;
        updateBarcodeNumbers();
    };
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const barcodeValue = document.createElement('div');
    barcodeValue.className = 'barcode-value';
    barcodeValue.textContent = '';

    barcodeItem.appendChild(barcodeNumber);
    barcodeItem.appendChild(removeButton);
    barcodeItem.appendChild(svg);
    barcodeItem.appendChild(barcodeValue);
    grid.appendChild(barcodeItem);

    generateBarcode(value, type, svg);
    barcodeInput.value = '';
    barcodeInput.focus();
}

// Drag and Drop functions
function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.dataset.index);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = Array.from(this.parentNode.children).indexOf(this);
    
    if (fromIndex !== toIndex) {
        const grid = document.getElementById('barcodeGrid');
        const items = Array.from(grid.children);
        const [movedItem] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, movedItem);
        
        // Reorder items in the DOM
        items.forEach(item => grid.appendChild(item));
        
        // Update numbers
        updateBarcodeNumbers();
    }
}

function clearAll() {
    document.getElementById('barcodeGrid').innerHTML = '';
    barcodeCount = 0;
    document.getElementById('error').textContent = '';
}

function updateBarcodeNumbers() {
    const items = document.querySelectorAll('.barcode-item');
    items.forEach((item, index) => {
        item.querySelector('.barcode-number').textContent = index + 1;
    });
}

function generateFromExcel() {
    const excelData = document.getElementById('excelData').value;
    const type = document.getElementById('barcodeType').value;
    const errorDiv = document.getElementById('error');
    
    if (!excelData) {
        errorDiv.textContent = '데이터를 붙여넣어주세요';
        return;
    }

    // Split the data by newlines and filter out empty lines
    const values = excelData.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (values.length === 0) {
        errorDiv.textContent = '유효한 데이터가 없습니다';
        return;
    }

    // Clear existing barcodes
    clearAll();

    // Generate barcodes for each value
    values.forEach(value => {
        if (barcodeCount >= maxBarcodes) {
            errorDiv.textContent = `최대 바코드 개수 (${maxBarcodes}개)에 도달했습니다`;
            return;
        }

        const grid = document.getElementById('barcodeGrid');
        const barcodeItem = document.createElement('div');
        barcodeItem.className = 'barcode-item';
        barcodeItem.draggable = true;
        
        // Add drag event listeners
        barcodeItem.addEventListener('dragstart', handleDragStart);
        barcodeItem.addEventListener('dragend', handleDragEnd);
        barcodeItem.addEventListener('dragover', handleDragOver);
        barcodeItem.addEventListener('drop', handleDrop);
        
        const barcodeNumber = document.createElement('div');
        barcodeNumber.className = 'barcode-number';
        barcodeNumber.textContent = barcodeCount + 1;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-barcode';
        removeButton.textContent = '×';
        removeButton.onclick = function() {
            barcodeItem.remove();
            barcodeCount--;
            updateBarcodeNumbers();
        };
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const barcodeValue = document.createElement('div');
        barcodeValue.className = 'barcode-value';
        barcodeValue.textContent = '';

        barcodeItem.appendChild(barcodeNumber);
        barcodeItem.appendChild(removeButton);
        barcodeItem.appendChild(svg);
        barcodeItem.appendChild(barcodeValue);
        grid.appendChild(barcodeItem);

        generateBarcode(value, type, svg);
        barcodeCount++;
    });

    // Clear the textarea
    document.getElementById('excelData').value = '';
}

function printBarcodes() {
    window.print();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add paste event listener for the textarea
    document.getElementById('excelData').addEventListener('paste', function(e) {
        // Let the paste event complete first
        setTimeout(() => {
            // Remove any carriage returns and extra spaces
            this.value = this.value.replace(/\r/g, '')
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n');
        }, 0);
    });

    // Add barcode when Enter key is pressed
    document.getElementById('barcodeValue').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addBarcode();
        }
    });
}); 