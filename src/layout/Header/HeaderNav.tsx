'use client';

import React, {JSX, useEffect} from "react";

import {Button} from "@/src/components/buttons/Button";
import {useAppDispatch, useAppSelector} from "@/src/store/hooks";
import {setProfileModalState} from "@/src/store/modalSlice";
import {User} from "@/lib/interfaces/user";
import {setUser} from "@/src/store/userSlice";

interface Props {
  user: User | null;
}

export function HeaderNav(props: Props) {
  const user = useAppSelector((state) => state.user.user)
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUser(props.user));
  }, [dispatch, props.user]);

  return (
    <div className="header__nav">
      {
        user
          ?
            <div className="header__nav-buttons">
              <Button text="Open profile" onClick={() => dispatch(setProfileModalState(true)) } />
              <Button text="Logout" link="login/getout" />
            </div>
          : <Button text="Sign in through Steam" link="login/auth" />
      }
    </div>
  )
}