import { Box, Button, Flex, Space, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { FC, useEffect, useRef, useState } from "react";

function wrapText(
  text: string,
  maxWidth: number,
  context: CanvasRenderingContext2D
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i];
    const metrics = context.measureText(testLine);
    const lineWidth = metrics.width;

    if (lineWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }

  lines.push(currentLine);
  return lines;
}

const write = (ctx: CanvasRenderingContext2D, text: string) => {
  const initialFontSize = 200;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  let fontSize = initialFontSize;
  let lines: string[] = [];

  while (fontSize > 0) {
    ctx.font = `${fontSize}px serif`;
    lines = wrapText(text, width - 20, ctx);
    const textHeight = lines.length * fontSize;
    const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b));
    const textWidth = ctx.measureText(longestLine).width;
    if (textHeight < height - 20 * 2 && textWidth < width - 20 * 2) break;
    else fontSize -= 1;
  }

  const fontHeight = ctx.measureText("M").width;
  const lineHeight = fontHeight * 1.2;
  const textHeight = lines.length * lineHeight;
  const start = (height - textHeight) / 2 + fontHeight;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "white";

  lines.forEach((line, i) => {
    const textWidth = ctx.measureText(line).width;
    ctx.fillText(line, (width - textWidth) / 2, start + i * lineHeight);
  });
};

export const TextImageCreator: FC<{ onSave: (blob: Blob | null) => void }> = ({
  onSave,
}) => {
  const [text, setText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    write(ctx, text);
  }, [text, canvasRef]);

  return (
    <Box>
      <TextInput
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Votre texte (ou emojis 🚀)"
      />
      <Space h={10} />
      <canvas
        id="canvas"
        width="320"
        height="240"
        ref={canvasRef}
        style={{ width: "100%", maxWidth: 500, margin: "auto" }}
      ></canvas>
      <Space h={10} />
      <Flex justify="right">
        <Button
          color="green"
          onClick={() => {
            canvasRef.current?.toBlob(onSave);
          }}
        >
          Enregistrer
        </Button>
      </Flex>
    </Box>
  );
};

export const openTextImageCreator = (onSave: (blob: Blob | null) => void) => {
  modals.open({
    title: "Créer une image avec du texte",
    children: (
      <TextImageCreator
        onSave={(b) => {
          onSave(b);
          modals.closeAll();
        }}
      />
    ),
  });
};
