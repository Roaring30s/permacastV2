import React, { useState, useContext, useEffect } from "react";
import { appContext } from "../utils/initStateGen.js";
import { useTranslation } from "react-i18next";

import { useLocation, useHistory } from "react-router-dom";
import {
  replaceDarkColorsRGB,
  isTooLight,
  trimANSLabel,
  RGBobjectToString,
} from "../utils/ui";
import { getCreator } from "../utils/podcast.js";
import { Cooyub, PlayButton, GlobalPlayButton } from "./reusables/icons";
import { EyeIcon } from "@heroicons/react/24/outline";
import { FaPause, FaPlay } from "react-icons/fa";
import { FiEye } from "react-icons/fi";

import Track from "./track";
import { getButtonRGBs } from "../utils/ui";

import { useRecoilState } from "recoil";
import {
  currentAudio,
  primaryData,
  secondaryData,
  switchFocus,
  videoSelection,
} from "../atoms";

export function Greeting() {
  const appState = useContext(appContext);
  const user = appState.user;
  const { t } = useTranslation();

  const label = user.ANSData?.currentLabel;
  // what about randomizing greetings?

  return (
    <div>
      <h1 className="text-zinc-100 text-xl">
        {label ? (
          <>
            {t("home.hi")} {trimANSLabel(label)}!
          </>
        ) : (
          <>{t("home.welcome")}</>
        )}
      </h1>
      <p className="text-zinc-400 mb-9">{t("home.subtext")}</p>
    </div>
  );
}

export function FeaturedEpisode() {
  const appState = useContext(appContext);
  // const {cover, podcastName, description, pid} = episode; --Episode breakdown
  const [switchFocus_, setSwitchFocus_] = useRecoilState(switchFocus);
  const [primaryData_, setPrimaryData_] = useRecoilState(primaryData); // Global Podcasts Object
  const [secondaryData_, setSecondaryData_] = useRecoilState(secondaryData); // Selected Podcast Object
  const [vs_, setVS_] = useRecoilState(videoSelection); // Selected Podcast Object
  const [ca_, setCA_] = useRecoilState(currentAudio); // Current Audio Object
  const { t } = useTranslation();

  let history = useHistory();
  let location = useLocation();
  // const rgb = RGBobjectToString(replaceDarkColorsRGB(episode.rgb)) --styling
  // const url = `/podcast/${primaryData_.pid}/${secondaryData_.eid}`; // --url

  useEffect(() => {
    setSecondaryData_(
      primaryData_.podcasts.filter((obj) => {
        if (switchFocus_) {
          return obj.contentType === "audio/";
        } else {
          return obj.contentType === "video/";
        }
      }).filter((obj_) => {
        return obj_.episodes.length > 0
      })
      .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)[0]

      // Math.floor(Math.random() * primaryData_.podcasts.filter((obj) => {
      //   if (switchFocus_) {
      //     return obj.contentType === "audio/";
      //   } else {
      //     return obj.contentType === "video/";
      //   }
      // }).length) + 1
    );
    
  }, [switchFocus_]);
  
  return (
    <div className="p-14 flex w-full border border-zinc-800 rounded-3xl">
      <img
        className="w-40 cursor-pointer mr-8"
        src={"https://arweave.net/" + secondaryData_.cover}
        alt={secondaryData_.podcastName}
        onClick={() => {
          history.push(
            `/podcast/${secondaryData_.pid}/${secondaryData_.episodes[0].eid}`
          );
        }}
      />
      <div className="col-span-2 my-3 text-zinc-100 max-w-xs md:max-w-lg mr-2">
        <div
          onClick={() => {
            history.push(
              `/podcast/${secondaryData_.pid}/${secondaryData_.episodes[0].eid}`
            );
          }}
          className="font-medium cursor-pointer line-clamp-1"
        >
          {secondaryData_.episodes[0].episodeName}
        </div>
        <div className="text-sm line-clamp-5">
          {secondaryData_.episodes[0].description}
        </div>
      </div>
      <div className="ml-auto">
        <>
          <div
            className="min-w-min btn btn-secondary border-0 mt-5 rounded-full flex items-center cursor-pointer backdrop-blur-md"
            // style={getButtonRGBs(rgb)}
            onClick={() => {
              if (switchFocus_) {
                appState.queue.playEpisode(
                  secondaryData_.episodes[0],
                  secondaryData_.episodes[0].eid
                );
                setCA_([secondaryData_.episodes[0].eid, "playing"]);
              } else {
                setVS_([
                  "https://arweave.net/" + secondaryData_.episodes[0].contentTx,
                  {},
                ]);
              }
            }}
          >
            {ca_[0] === secondaryData_.episodes[0].eid ? (
              <FaPause className="w-3 h-3" />
            ) : (
              <FaPlay className="w-3 h-3" />
            )}
            <div className="ml-2">
              {t(
                ca_[0] === secondaryData_.episodes[0].eid
                  ? "home.pausefeaturedepisode"
                  : "home.playfeaturedepisode"
              )}
            </div>
          </div>
          <div
            className="min-w-min btn btn-secondary border-0 mt-5 rounded-full flex items-center cursor-pointer backdrop-blur-md"
            // style={getButtonRGBs(rgb)}
            onClick={() => {
              history.push(
                `/podcast/${secondaryData_.pid}/${secondaryData_.episodes[0].eid}`
                // console.log(secondaryData_.episodes.filter((obj) => {
                //   return obj.eid === secondaryData_.episodes[0].eid
                // })[0]) // -- Direct access to Episode
              );
            }}
          >
            <FiEye className="h-5 w-5" />
            <div className="ml-2">{t("home.viewfeaturedepisode")}</div>
          </div>
        </>
      </div>
    </div>
  );
}

export function FeaturedPodcast({ podcast }) {
  const appState = useContext(appContext);
  const history = useHistory();
  const {
    rgb,
    episodesCount,
    cover,
    podcastName,
    title,
    description,
    firstTenEpisodes,
    podcastId,
  } = podcast;
  const textColor = isTooLight(rgb) ? "black" : "white";
  const { enqueuePodcast, play } = appState.queue;
  const { t } = useTranslation();

  const [switchFocus_, setSwitchFocus_] = useRecoilState(switchFocus);
  const [vs_, setVS_] = useRecoilState(videoSelection);
  const [primaryData_, setPrimaryData_] = useRecoilState(primaryData); // Global Podcasts Object
  const [secondaryData_, setSecondaryData_] = useRecoilState(secondaryData); // Selected Podcast Object
  const [colorData_, setColorData_] = useState([]);
  const [ca_, setCA_] = useRecoilState(currentAudio); // Current Audio Object

  return (
    <>
      <div
        className={`mt-4 rounded-3xl text-white/30 relative overflow-hidden`}
      >
        <img
          src={`https://arweave.net/${cover}`}
          className={`absolute top-0 right-0 h-full opacity-80 object-cover`}
        />
        <div
          className={`w-full h-full bg-black/20 backdrop-blur-lg absolute top-0 right-0`}
        />
        <div className="h-1/6 w-full px-5 pb-2 cursor-pointer relative">
          <div
            onClick={() => {
              history.push(`/podcast/${secondaryData_.pid}`);
            }}
          >
            <div className="pt-5 pb-3 text-xs">
              {secondaryData_.episodes.length}{" "}
              {secondaryData_.episodes.length > 1
                ? t("home.episodes")
                : "episode"}
            </div>
            <div className="w-full mb-7 max-w-[180px] overflow-x-hidden mx-auto">
              <img
                className="object-cover aspect-square h-[180px]"
                src={"https://arweave.net/" + cover}
                alt={podcastName}
              />
            </div>
          </div>
          <div className="h-16 flex items-center">
            <div
              className="z-10"
              onClick={() => {
                // Promise.all(firstTenEpisodes(true)).then((episodes) => {
                //   enqueuePodcast(episodes);
                //   play(episodes[0]);
                // });
                if (switchFocus_) {
                  appState.queue.playEpisode(
                    secondaryData_.episodes[0],
                    secondaryData_.episodes[0].eid
                  );
                  setCA_([secondaryData_.episodes[0].eid, "playing"]);
                } else {
                  setVS_([
                    "https://arweave.net/" +
                      secondaryData_.episodes[0].contentTx,
                    {},
                  ]);
                }
              }}
            >
              {/* <GlobalPlayButton
                size="20"
                innerColor={"black"}
                outerColor={textColor}
              /> */}
              <div
                className={`text-black/80 bg-white/50 rounded-[50%] w-[40px] h-[40px] flex flex-col justify-center items-center`}
              >
                {ca_[0] === secondaryData_.episodes[0].eid ? (
                  <FaPause className="w-4 h-4" />
                ) : (
                  <FaPlay className="w-4 h-4" />
                )}
              </div>
            </div>
            <div
              className="ml-3"
              onClick={() => history.push(`/podcast/${podcastId}`)}
            >
              <div className="text-lg line-clamp-1 cursor-pointer">
                {secondaryData_.podcastName}
              </div>
              <div className="text-xs max-w-[95%] line-clamp-2">
                {description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function FeaturedPodcastsMobile() {
  const [switchFocus_, setSwitchFocus_] = useRecoilState(switchFocus);
  const [primaryData_, setPrimaryData_] = useRecoilState(primaryData);
  const [secondaryData_, setSecondaryData_] = useRecoilState(secondaryData);
  const podcasts = primaryData_.podcasts
    .filter((obj) => {
      if (switchFocus_) {
        return obj.contentType === "audio/";
      } else {
        return obj.contentType === "video/";
      }
    })
    .filter((obj__) => {
      return obj__.episodes.length > 0;
    });

  return (
    <div className="carousel">
      {podcasts.map((podcast, index) => (
        <div
          className="carousel-item max-w-[280px] md:max-w-xs pr-4"
          key={index}
        >
          <FeaturedPodcast podcast={podcast} />
        </div>
      ))}
    </div>
  );
}

export function RecentlyAdded() {
  const { t } = useTranslation();
  const [switchFocus_, ] = useRecoilState(switchFocus);
  const [primaryData_, ] = useRecoilState(primaryData);

  const [episodes, setEpisodes] = useState([]);
  const createdAt_ = (a, b) => {
    if (a.uploadedAt < b.uploadedAt) {
      return 1;
    } else if (a.uploadedAt > b.uploadedAt) {
      return -1;
    } else {
      return 0;
    }
  };
  useEffect(() => {
    const data_ = primaryData_.podcasts
      .filter((obj) => {
        if (switchFocus_) {
          return obj.contentType === "audio/";
        } else {
          return obj.contentType === "video/";
        }
      })
      .filter((obj_) => {
        return obj_.episodes.length > 0;
      });
    data_.forEach((obj) => {
      const x_ = obj.episodes;
      setEpisodes(episodes.concat(x_));
    });
  }, []);
  return (
    <div className="">
      <h2 className="text-zinc-400 mb-4">{t("home.recentlyadded")}</h2>
      <div className="grid grid-rows-3 gap-y-4 text-zinc-100">
        {episodes.sort(createdAt_).map((episode, index) => (
          <div
            key={index}
            className="border border-zinc-800 rounded-3xl p-3 w-full"
          >
            <Track episode={episode} includeDescription={true} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturedCreators() {
  const appState = useContext(appContext);
  const history = useHistory();
  const { t } = useTranslation();
  const { themeColor } = appState.theme;
  const bg = themeColor.replace("rgb", "rgba").replace(")", ", 0.1)");

  const [primaryData_] = useRecoilState(primaryData);
  let data_ = [];
  primaryData_.podcasts.forEach((obj) => {
    if (!data_.includes(primaryData_.podcasts.filter((obj_) => {
      return obj_.owner === obj.owner
    })[0])) {
      data_.push(obj);
    }
  });
  data_ = data_.map(value => ({ value, sort: Math.random() }))
               .sort((a, b) => a.sort - b.sort)
               .map(({ value }) => value)

  return (
    <div>
      <h2 className="text-zinc-400 mb-4">{t("home.featuredcreators")}</h2>
      {Object.keys(primaryData_).length < 1 ? (
        <>
          <div className="bg-gray-300/30 animate-pulse w-full h-20 mb-4 mt-4 rounded-full"></div>
          <div className="bg-gray-300/30 animate-pulse w-full h-20 mb-4 rounded-full"></div>
          <div className="bg-gray-300/30 animate-pulse w-full h-20 mb-4 rounded-full"></div>
        </>
      ) : (
        <>
          {data_.map((creator, index) => (
            <div key={index}>
              <div className="flex justify-between items-center p-4 mb-4 w-full border-zinc-800 border rounded-3xl">
                <div className="flex items-center">
                  {creator?.cover ? (
                    <img
                      className="rounded-full h-12 w-12 object-cover"
                      src={"https://arweave.net/" + creator?.cover}
                      alt={creator?.author}
                    />
                  ) : (
                    <Cooyub
                      svgStyle="rounded-lg h-12 w-12"
                      rectStyle="h-6 w-6"
                      fill={"rgb(255, 80, 0)"}
                    />
                  )}
                  <div className="ml-4 flex items-center">
                    <div className="flex flex-col">
                      <div className="text-zinc-100 text-sm cursor-pointer">
                        {creator?.author || creator?.owner}
                      </div>
                      {creator?.label && (
                        <div className="text-zinc-400 cursor-pointer text-[8px]">
                          @{creator?.label}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className=" ">
                  <p
                    className="px-3 py-2 rounded-full text-[10px] ml-5 cursor-pointer"
                    style={{ backgroundColor: bg, color: themeColor }}
                    onClick={() => history.push("/creator/" + creator?.owner)}
                  >
                    {t("view")}
                  </p>
                </div>
              </div>
            </div>
          )
          )}
        </>
      )}
    </div>
  );
}
