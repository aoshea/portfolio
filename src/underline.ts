setTimeout(function() {
  const anchors: HTMLAnchorElement[] = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a")
  );

  let id: Number = 0;

  function createAnchorUnderline(el: HTMLAnchorElement) {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
      document.createElement("canvas")
    );
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    const rect: ClientRect = el.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 100;
    canvas.classList.add("underline");
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, rect.width, 100);
    el.appendChild(canvas);
  }

  anchors.forEach(createAnchorUnderline);
}, 1000);
