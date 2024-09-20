// **app.js**

document.addEventListener('DOMContentLoaded', () => {
    // Create a style element for CSS
    const style = document.createElement('style');
    style.innerHTML = `
      #canvas {
        border: 1px solid black;
        cursor: crosshair;
      }
      .color-picker {
        margin: 5px;
      }
    `;
    document.head.appendChild(style);

    // Create the main heading
    const heading = document.createElement('h1');
    heading.innerText = 'Select your country';
    document.body.appendChild(heading);

    // Create the actual dropdown (select element)
    const select = document.createElement('select');
    select.id = 'countrySelect';

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select Country';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    // Optionally add some dummy options (they won't be shown)
    const dummyOption = document.createElement('option');
    dummyOption.value = 'dummy';
    dummyOption.text = 'Dummy Option';
    select.appendChild(dummyOption);

    document.body.appendChild(select);

    // Event listener for the select element
    select.addEventListener('mousedown', (event) => {
        event.preventDefault(); // Prevent the dropdown from opening

        // Change the header text
        heading.innerText = 'Draw the flag of your country';

        // Remove or hide the select element
        select.style.display = 'none';

        // Now create the canvas and other elements
        setupDrawingInterface();
    });

    // Function to set up the drawing interface
    function setupDrawingInterface() {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        canvas.width = 500;
        canvas.height = 300;
        document.body.appendChild(canvas);

        // Line break
        document.body.appendChild(document.createElement('br'));

        // Color selection buttons
        const colors = ['red', 'green', 'blue', 'yellow', 'black', 'white', 'orange'];
        colors.forEach(color => {
          const button = document.createElement('button');
          button.className = 'color-picker';
          button.dataset.color = color;
          button.style.backgroundColor = color;
          button.innerText = color.charAt(0).toUpperCase() + color.slice(1);
          document.body.appendChild(button);
        });

        // Line breaks
        document.body.appendChild(document.createElement('br'));
        document.body.appendChild(document.createElement('br'));

        // Brush size label and slider
        const brushLabel = document.createElement('label');
        brushLabel.htmlFor = 'lineWidth';
        brushLabel.innerText = 'Brush Size:';
        document.body.appendChild(brushLabel);

        const brushSize = document.createElement('input');
        brushSize.type = 'range';
        brushSize.id = 'lineWidth';
        brushSize.name = 'lineWidth';
        brushSize.min = 1;
        brushSize.max = 20;
        brushSize.value = 5;
        document.body.appendChild(brushSize);

        // Line breaks
        document.body.appendChild(document.createElement('br'));
        document.body.appendChild(document.createElement('br'));

        // Submit button
        const submitBtn = document.createElement('button');
        submitBtn.id = 'submitBtn';
        submitBtn.innerText = 'Submit Drawing';
        document.body.appendChild(submitBtn);

        // Clear canvas button
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearBtn';
        clearBtn.innerText = 'Clear Canvas';
        document.body.appendChild(clearBtn);

        // Response heading
        const responseHeading = document.createElement('h2');
        responseHeading.innerText = 'AI Response:';
        document.body.appendChild(responseHeading);

        // Response text paragraph
        const responseText = document.createElement('p');
        responseText.id = 'responseText';
        document.body.appendChild(responseText);

        // **Drawing Functionality**

        // Get canvas context
        const ctx = canvas.getContext('2d');

        // Default drawing settings
        let drawing = false;
        let currentColor = 'black';
        let lineWidth = 5;

        // Event listeners for drawing
        canvas.addEventListener('mousedown', () => { drawing = true; });
        canvas.addEventListener('mouseup', () => { drawing = false; ctx.beginPath(); });
        canvas.addEventListener('mouseout', () => { drawing = false; ctx.beginPath(); });
        canvas.addEventListener('mousemove', draw);

        function draw(event) {
          if (!drawing) return;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.strokeStyle = currentColor;

          // Get the mouse position relative to the canvas
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
        }

        // Event listeners for color selection
        const colorPickers = document.querySelectorAll('.color-picker');
        colorPickers.forEach(button => {
          button.addEventListener('click', () => {
            currentColor = button.getAttribute('data-color');
          });
        });

        // Event listener for brush size
        brushSize.addEventListener('input', (event) => {
          lineWidth = event.target.value;
        });

        // Event listener for clearing the canvas
        clearBtn.addEventListener('click', () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        // **API Integration**

        // Event listener for submitting the drawing
        submitBtn.addEventListener('click', () => {
          // Convert canvas to Base64
          const imageDataURL = canvas.toDataURL('image/png');
          const base64Data = imageDataURL.split(',')[1]; // Remove data URL prefix

          // Send the Base64 image data to the API
          sendToAPI(base64Data);
        });

        function sendToAPI(imageData) {
          const apiUrl = 'https://api.anthropic.com/v1/messages';
          const apiKey = ''; // Replace with your actual API key

          const data = {
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 1024,
            messages: [
              {
                "role": "user",
                "content": [
                  {
                    "type": "image",
                    "source": {
                      "type": "base64",
                      "media_type": "image/png",
                      "data": imageData,
                    },
                  },
                  {
                    "type": "text",
                    "text": "This drawing is the flag of a country, which country is it? Answer with only the name of a country and no other text."
                  }
                ],
              }
            ]
          };

          fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify(data)
          })
          .then(response => response.json())
          .then(responseData => {
            console.log('Response:', responseData);
            responseText.innerText = responseData.content[0].text;
          })
          .catch(error => {
            console.error('Error:', error);
          });
        }
    } // end of setupDrawingInterface
}); // end of DOMContentLoaded

