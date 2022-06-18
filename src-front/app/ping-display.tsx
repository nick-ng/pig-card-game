import React from "react";
import styled from "styled-components";

const Container = styled.div`
  position: fixed;
  top: 0.2em;
  right: 0.5em;
  opacity: 0.25;
  transition: all 0.5s;

  &:hover {
    opacity: 1;
  }
`;

export default function PingDisplay({
  roundTripTime,
}: {
  roundTripTime: number;
}) {
  return <Container>Ping: {roundTripTime} ms</Container>;
}
