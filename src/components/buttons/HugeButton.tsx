'use client';

import React from "react";

interface Props {
  text: string;
  disabled: boolean;
  onClick?: () => void;
}

export function HugeButton(props: Props) {
  return (
    <button className="button button--huge" disabled={props.disabled} onClick={props.onClick}>
      {props.text}
    </button>
  )
}