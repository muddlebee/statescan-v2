import styled, { css } from "styled-components";

export const Flex = styled.div`
  display: flex;
  align-items: center;
  ${(p) =>
    p.gap &&
    css`
      gap: ${p.gap}px;
    `}
`;

export const FlexBetween = styled(Flex)`
  justify-content: space-between;
`;
