import styled from "styled-components";
import { blue, grey } from "@mui/material/colors";

const CustomInput = styled.input`
  width: 320px;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${({ theme }) => (theme?.palette?.mode === "dark" ? grey[300] : grey[900])};
  background: ${({ theme }) => (theme?.palette?.mode === "dark" ? grey[900] : "#fff")};
  border: 1px solid ${({ theme }) => (theme?.palette?.mode === "dark" ? grey[700] : grey[200])};
  box-shadow: 0 2px 2px ${({ theme }) => (theme?.palette?.mode === "dark" ? grey[900] : grey[50])};

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    outline: 0;
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${({ theme }) => (theme?.palette?.mode === "dark" ? blue[600] : blue[200])};
  }
`;

export default CustomInput;
