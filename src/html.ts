export function renderCSSTriangle(height: number, borderLeft: number, borderRight: number, transform: string, className: string = '') {
    return `<div class="${className}" style="` +
        `border-bottom-width: ${height}px;` +
        `border-left-width: ${borderLeft}px; ` +
        `border-right-width: ${borderRight}px;` +
        `transform: ${transform};` +
        `"></div>`;
}

export function createTemplate(triangles: string) {
    return `
    <!DOCTYPE html>
    <html>
    
    <head>
        <style>
            body,
            main {
                height: 100vh;
                width: 100vw;
                transform-style: preserve-3d;
            }
    
            main {
                perspective: 800px;
            }
    
            .center {
                position: relative;
                transform-style: preserve-3d;
                width: 0;
                height: 0;
                left: 50%;
                top: 50%;
                animation: spin 5s linear infinite;
            }
    
            .triangle {
                width: 0;
                height: 0;
                position: absolute;
                transform-origin: bottom left;
    
                border: 0px solid transparent;
                border-bottom-color: rgba(255, 0, 0, 0.2);
            }
    
            @keyframes spin {
                0% {
                    transform: translateZ(-200px) translateY(100px) rotateY(0deg)
                }
    
                100% {
                    transform: translateZ(-200px) translateY(100px) rotateY(360deg)
                }
            }
        </style>
    </head>
    
    <body>
        <main>
            <div class="center">
    
                ${triangles}

            </div>
        </main>
    </body>
    
    </html>
    `;
}