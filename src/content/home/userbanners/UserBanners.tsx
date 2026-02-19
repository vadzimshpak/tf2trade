'use client';

import React from "react";
import {Button} from "@/src/components/buttons/Button";
import {useAppDispatch, useAppSelector} from "@/src/store/hooks";
import {setProfileModalState} from "@/src/store/modalSlice";

export function LoginBanner() {
  const user = useAppSelector(state => state.user.user);

  return (
    <>
      {
        !user
          ?
            <div className="banner">
              <div className="banner__header">
                Please authenticate to see your inventory
              </div>
              <div className="banner__action">
                <Button text="Login" link="login/auth" />
              </div>
            </div>
          : null
      }
    </>
  )
}

export function TradelinkBanner() {
  const user = useAppSelector(state => state.user.user);
  const dispatch = useAppDispatch();

  return (
    <>
      {
        user && !user?.tradelink
          ?
            <div className="banner">
              <div className="banner__header">
                Seems like your tradelink is missing!
              </div>
              <div className="banner__body">
                You need to set it up to use our service.
              </div>
              <div className="banner__action">
                <Button text="Change tradelink" onClick={() => dispatch(setProfileModalState(true))} />
              </div>
            </div>
          : null
      }
    </>
  )
}

export function SteamBrokenBanner() {
  const inventory = useAppSelector(state => state.user.inventory);

  return (
    <>
      {
        inventory?.success === 0
          ?
            <div className="banner">
              <div className="banner__header">
                Your profile or inventory settings are set to private. We can't acquire the
                items of your TF2 inventory.
              </div>
              <div className="banner__body">
                Sometimes Steam has issues with its stability of the inventory servers. Make sure that Steam is not broken
              </div>
            </div>
          : null
      }
    </>
  )
}
