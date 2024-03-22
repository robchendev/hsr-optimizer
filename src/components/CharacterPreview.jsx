import React, { useEffect, useState } from 'react'
import { Button, Flex, Image } from 'antd'
import PropTypes from 'prop-types'
import { RelicScorer } from 'lib/relicScorer.ts'
import { StatCalculator } from 'lib/statCalculator'
import { DB } from 'lib/db'
import { Assets } from 'lib/assets'
import { Constants, ElementToDamage } from 'lib/constants.ts'
import {
  defaultGap,
  innerW,
  lcInnerH,
  lcInnerW,
  lcParentH,
  lcParentW,
  middleColumnWidth,
  parentH,
  parentW,
} from 'lib/constantsUi'

import Rarity from 'components/characterPreview/Rarity'
import StatText from 'components/characterPreview/StatText'
import RelicModal from 'components/RelicModal'
import RelicPreview from 'components/RelicPreview'
import { RelicModalController } from '../lib/relicModalController'
import { CharacterStatSummary } from 'components/characterPreview/CharacterStatSummary'
import { EditOutlined } from '@ant-design/icons'
import EditImageModal from './EditImageModal'
import { Message } from 'lib/message'
import CharacterCustomPortrait from './CharacterCustomPortrait'
import { SaveState } from 'lib/saveState'

// This is hardcoded for the screenshot-to-clipboard util. Probably want a better way to do this if we ever change background colors
export function CharacterPreview(props) {
  console.log('@CharacterPreview')

  const { source, character } = props

  const isScorer = source == 'scorer'
  const isBuilds = source == 'builds'

  const backgroundColor = isBuilds ? '#2A3C64' : '#182239'

  const relicsById = window.store((s) => s.relicsById)
  const characterTabBlur = window.store((s) => s.characterTabBlur)
  const setCharacterTabBlur = window.store((s) => s.setCharacterTabBlur)
  const [selectedRelic, setSelectedRelic] = useState()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState(null) // <null | CustomImageConfig>

  useEffect(() => {
    setCustomPortrait(null)
  }, [character])

  function onEditOk(relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic, relic)
    setSelectedRelic(updatedRelic)
  }

  function onEditPortraitOk(portrait) {
    setCustomPortrait({ ...portrait })
    DB.saveCharacterPortrait(character.id, portrait)
    Message.success('Successfully saved portrait')
    SaveState.save()
    setEditPortraitModalOpen(false)
  }

  function onDeletePortrait() {
    setCustomPortrait(null)
    DB.deleteCharacterPortrait(character.id)
    Message.success('Successfully reverted portrait')
    SaveState.save()
  }

  if (!character) {
    return (
      <Flex style={{ display: 'flex', height: parentH, backgroundColor: backgroundColor }} gap={defaultGap} id={props.id}>

        <div style={{ width: parentW, overflow: 'hidden', outline: '2px solid #243356', height: '100%', borderRadius: '10px' }}>
        </div>

        <Flex gap={defaultGap}>
          <Flex vertical gap={defaultGap} align="center" style={{ outline: '2px solid #243356', width: '100%', height: '100%', borderRadius: '10px' }}>
            <Flex vertical style={{ width: middleColumnWidth, height: 280 * 2 + defaultGap }} justify="space-between">
              <Flex></Flex>
            </Flex>
          </Flex>

          <Flex vertical gap={defaultGap}>
            <RelicPreview setSelectedRelic={setSelectedRelic} />
            <RelicPreview setSelectedRelic={setSelectedRelic} />
            <RelicPreview setSelectedRelic={setSelectedRelic} />
          </Flex>

          <Flex vertical gap={defaultGap}>
            <RelicPreview setSelectedRelic={setSelectedRelic} />
            <RelicPreview setSelectedRelic={setSelectedRelic} />
            <RelicPreview setSelectedRelic={setSelectedRelic} />
          </Flex>
        </Flex>
      </Flex>
    )
  }

  let displayRelics
  let scoringResults
  let finalStats
  if (isScorer || isBuilds) {
    let relicsArray = Object.values(character.equipped)
    scoringResults = RelicScorer.scoreCharacterWithRelics(character, relicsArray)
    displayRelics = character.equipped
    finalStats = StatCalculator.calculateCharacterWithRelics(character, Object.values(character.equipped))
  } else {
    scoringResults = RelicScorer.scoreCharacter(character)
    displayRelics = {
      Head: relicsById[character.equipped?.Head],
      Hands: relicsById[character.equipped?.Hands],
      Body: relicsById[character.equipped?.Body],
      Feet: relicsById[character.equipped?.Feet],
      PlanarSphere: relicsById[character.equipped?.PlanarSphere],
      LinkRope: relicsById[character.equipped?.LinkRope],
    }
    finalStats = StatCalculator.calculate(character)
  }
  const scoredRelics = scoringResults.relics || []

  const lightConeId = character.form.lightCone
  const lightConeLevel = character.form.lightConeLevel
  const lightConeSuperimposition = character.form.lightConeSuperimposition
  const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  const lightConeName = lightConeMetadata?.name || ''
  const lightConeSrc = Assets.getLightConePortrait(lightConeMetadata) || ''

  const characterId = character.form.characterId
  const characterLevel = character.form.characterLevel
  const characterEidolon = character.form.characterEidolon
  const characterMetadata = DB.getMetadata().characters[characterId]
  const characterName = characterMetadata.displayName
  const characterPath = characterMetadata.path
  const characterElement = characterMetadata.element
  const characterPortraitDB = character.portrait

  const elementalDmgValue = ElementToDamage[characterElement]
  console.log(displayRelics)
  return (
    <Flex style={{ display: character ? 'flex' : 'none', height: parentH, backgroundColor: backgroundColor }} id={props.id}>
      <RelicModal selectedRelic={selectedRelic} type="edit" onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen} />

      {!isBuilds
      && (
        <div className="character-build-portrait" style={{ width: `${parentW}px`, height: `${parentH}px`, overflow: 'hidden', borderRadius: '10px', marginRight: defaultGap }}>
          <div
            style={{
              position: 'relative',
            }}
          >
            {(characterPortraitDB || customPortrait)
              ? (
                <CharacterCustomPortrait
                  customPortrait={customPortrait ?? characterPortraitDB}
                  parentW={parentW}
                  isBlur={characterTabBlur && !isScorer}
                  setBlur={setCharacterTabBlur}
                />
              )
              : (
                <img
                  src={Assets.getCharacterPortraitById(character.id)}
                  style={{
                    position: 'absolute',
                    left: -DB.getMetadata().characters[character.id].imageCenter.x / 2 + parentW / 2,
                    top: -DB.getMetadata().characters[character.id].imageCenter.y / 2 + parentH / 2,
                    width: innerW,
                    filter: (characterTabBlur && !isScorer) ? 'blur(20px)' : '',
                  }}
                  onLoad={() => setTimeout(() => setCharacterTabBlur(false), 50)}
                />
              )}
            {(!characterPortraitDB && !customPortrait)
              ? (
                <Flex
                  style={{
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    visibility: 'hidden',
                    flex: 'auto',
                    position: 'absolute',
                    top: parentH - 37,
                    left: 5,
                  }}
                  className="character-build-portrait-button"

                >
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setEditPortraitModalOpen(true)}
                    type="primary"
                  >
                    Edit portrait
                  </Button>
                </Flex>

              )
              : (
                <Flex
                  style={{
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    visibility: 'hidden',
                    flex: 'auto',
                    position: 'absolute',
                    top: parentH - 37,
                    left: 5,
                  }}
                  className="character-build-portrait-button"
                  gap={6}
                >
                  <Button

                    className="character-build-portrait-button"
                    icon={<EditOutlined />}
                    onClick={() => setEditPortraitModalOpen(true)}
                    type="primary"
                  >
                    Update crop
                  </Button>
                  <Button

                    icon={<EditOutlined />}
                    onClick={onDeletePortrait}
                    type="primary"
                    danger
                  >
                    Revert to default
                  </Button>
                </Flex>
              )}

            <EditImageModal
              title={`${!characterPortraitDB && !customPortrait ? 'Edit Portrait' : 'Update crop'}`}
              aspectRatio={parentW / parentH}
              currentImage={customPortrait ?? characterPortraitDB}
              open={editPortraitModalOpen}
              setOpen={setEditPortraitModalOpen}
              onOk={onEditPortraitOk}
              defaultImageUrl={Assets.getCharacterPortraitById(character.id)}
              width={500}
            />
          </div>
        </div>
      )}

      <Flex gap={defaultGap}>
        <Flex vertical gap={defaultGap} align="center">
          <Flex vertical style={{ width: middleColumnWidth, height: 280 * 2 + defaultGap }} justify="space-between">
            <Flex vertical gap={defaultGap}>
              <Flex justify="space-between" style={{ height: 50 }}>
                <Image
                  preview={false}
                  width={50}
                  src={Assets.getElement(characterElement)}
                />
                <Rarity rarity={characterMetadata.rarity} />
                <Image
                  preview={false}
                  width={50}
                  src={Assets.getPathFromClass(characterPath)}
                />
              </Flex>
              <Flex vertical>
                <StatText style={{ fontSize: 24, fontWeight: 400, textAlign: 'center' }}>
                  {characterName}
                </StatText>
                <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }}>
                  {`Lv${characterLevel} E${characterEidolon}`}
                </StatText>
              </Flex>
            </Flex>

            <CharacterStatSummary finalStats={finalStats} elementalDmgValue={elementalDmgValue} />

            <Flex vertical>
              <StatText style={{ fontSize: 17, fontWeight: 600, textAlign: 'center', color: '#e1a564' }}>
                {`Character score: ${scoringResults.totalScore.toFixed(0)} ${scoringResults.totalScore == 0 ? '' : '(' + scoringResults.totalRating + ')'}`}
              </StatText>
            </Flex>

            <Flex vertical>
              <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }} ellipsis={true}>
                {`${lightConeName}`}
&nbsp;
              </StatText>
              <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }}>
                {`Lv${lightConeLevel} S${lightConeSuperimposition}`}
              </StatText>
            </Flex>
          </Flex>
          <div style={{ width: `${lcParentW}px`, height: `${lcParentH}px`, overflow: 'hidden', borderRadius: '10px' }}>
            <img
              src={lightConeSrc}
              style={{
                width: lcInnerW,
                transform: `translate(${(lcInnerW - lcParentW) / 2 / lcInnerW * -100}%, ${(lcInnerH - lcParentH) / 2 / lcInnerH * -100 + 8}%)`, // Magic # 8 to fit certain LCs
                filter: (characterTabBlur && !isScorer) ? 'blur(20px)' : '',
              }}
            />
          </div>
        </Flex>

        <Flex vertical gap={defaultGap}>
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.Head}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find((x) => x.part == Constants.Parts.Head)}
          />
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.Body}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find((x) => x.part == Constants.Parts.Body)}
          />
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.PlanarSphere}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find((x) => x.part == Constants.Parts.PlanarSphere)}
          />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.Hands}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find((x) => x.part == Constants.Parts.Hands)}
          />
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.Feet}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find((x) => x.part == Constants.Parts.Feet)}
          />
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.LinkRope}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find((x) => x.part == Constants.Parts.LinkRope)}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
CharacterPreview.propTypes = {
  source: PropTypes.string,
  character: PropTypes.object,
  id: PropTypes.string,
}
