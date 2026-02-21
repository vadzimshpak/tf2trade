'use client';
import React from "react";

interface Props {
  text: string;
  onClick?: () => void;
  link?: string;
  newWindow?: boolean;
}

export function Button(props: Props) {

  function processClick() {
    if (props.link && props.newWindow) {
      window.open(props.link);
    } else if (props.link) {
      window.location.href = props.link;
    }

    if (props.onClick) {
      props.onClick();
    }
  }

  return (
    <button className="button" onClick={processClick}>
      {props.text}
    </button>
  )
}