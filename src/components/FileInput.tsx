import { Box } from "@mantine/core";
import React, { ChangeEvent, FC, ReactNode } from "react";

export const FileInput: FC<{
  accept?: string;
  onChange: (file: File) => void;
  children?: ReactNode;
}> = ({ onChange, children, accept }) => {
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const fileUploaded = event.target.files[0];
    onChange(fileUploaded);
  };

  return (
    <>
      <Box onClick={handleClick} sx={{ cursor: "pointer" }} p={10} h="100%">
        <Box
          h="100%"
          sx={{
            border: "1px dashed",
            borderColor: "#ccc",
            borderRadius: 5,
            "&:hover": {
              borderColor: "#000",
            },
          }}
        >
          {children}
        </Box>
      </Box>
      <input
        accept={accept}
        style={{
          display: "none",
        }}
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
      />
    </>
  );
};
