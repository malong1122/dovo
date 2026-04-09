import { Html } from "@react-three/drei";
import styled from "styled-components";

const Label = styled(Html)`
  pointer-events: none;
  width: max-content;
  display: flex;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #f0b15d;
  color: #ea580c;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
`;

export default Label;
