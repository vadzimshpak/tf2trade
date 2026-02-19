'use client';

import {useState} from "react";

import {Button} from "@/src/components/buttons/Button";
import Input from "@/src/components/input/Input";

import {useAppDispatch, useAppSelector} from "@/src/store/hooks";
import {setProfileModalState} from "@/src/store/modalSlice";
import {updateTradelink} from "@/src/store/userSlice";

interface  ChangeTradelinkProps {
  tradelink: string;
  setTradelink: (tradelink: string) => void;
}

function StatisticsBanner() {
  return (
    <div className="banner">
      <div className="banner__header">
        Statistics
      </div>
      <div className="banner__body">
        Coming soon...
      </div>
    </div>
  )
}

function ChangeTradelinkBanner(props: ChangeTradelinkProps) {

  return (
    <div className="banner">
      <div className="banner__header">
        Setup new tradelink
      </div>
      <div className="banner__body">
        You can find your tradelink here: <a href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url" target="_blank">link</a>
      </div>
      <div className="banner__action">
        <Input placeholder="Tradelink" value={props.tradelink} onChange={props.setTradelink} />
      </div>
    </div>
  )
}

export function ProfileModal() {
  const show = useAppSelector(state => state.modal.profileModalOpen);
  const user = useAppSelector(state => state.user.user);
  const dispatch = useAppDispatch();

  const [tradelink, setTradelink] = useState(user?.tradelink || "");

  async function applyChanges() {
    const response = await fetch("/api/user/tradelink", {
      method: "POST",
      body: JSON.stringify({ tradelink: tradelink }),
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json();
    if (!data.success) {
      alert("Error while updating profile...")
      return;
    }

    dispatch(updateTradelink(tradelink));
    dispatch(setProfileModalState(false));
  }

  return (
    <>
      {
      show
        ?
          <div className="modal-wrapper">
            <div className="modal">
              <div className="modal__header">
                <h2>
                  Hello User!
                </h2>
                <span className="cursor-pointer text-4xl" onClick={() => dispatch(setProfileModalState(false))}>
                &times;
              </span>
              </div>
              <div className="modal__body">
                <StatisticsBanner />
                <ChangeTradelinkBanner tradelink={tradelink} setTradelink={setTradelink} />
              </div>
              <div className="modal__footer">
                <Button text="Apply changes" onClick={applyChanges} />
              </div>
            </div>
          </div>
        : null
      }
    </>
  )
}