/* eslint-disable jsx-a11y/no-static-element-interactions */ // prevented warning in bootstrap code

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import ReactStars from 'react-stars';

import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Image from 'react-bootstrap/lib/Image';
import Label from 'react-bootstrap/lib/Label';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import { API_URL } from 'fm3/backendDefinitions';

import { galleryClear, galleryRequestImage, galleryShowOnTheMap, gallerySetComment, gallerySubmitComment, gallerySubmitStars }
  from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';

const dateFormat = new Intl.DateTimeFormat('sk', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

class GalleryViewerModal extends React.Component {
  static propTypes = {
    imageIds: PropTypes.arrayOf(PropTypes.number.isRequired),
    image: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      user: PropTypes.shape({
        // TODO
      }),
      // TODO , createdAt, takenAt, tags, comments
      rating: PropTypes.number.isRequired,
      myStars: PropTypes.number,
    }),
    activeImageId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    onImageSelect: PropTypes.func.isRequired,
    comment: PropTypes.string.isRequired,
    onShowOnTheMap: PropTypes.func.isRequired,
    onCommentChange: PropTypes.func.isRequired,
    onCommentSubmit: PropTypes.func.isRequired,
    onStarsChange: PropTypes.func.isRequired,
    authenticated: PropTypes.bool,
  }

  handlePreviousClick = (e) => {
    e.preventDefault();

    const { imageIds, activeImageId, onImageSelect } = this.props;
    const index = imageIds.findIndex(id => id === activeImageId);
    if (index > 0) {
      onImageSelect(imageIds[index - 1]);
    }
  }

  handleNextClick = (e) => {
    e.preventDefault();
    const { imageIds, activeImageId, onImageSelect } = this.props;
    const index = imageIds.findIndex(id => id === activeImageId);
    if (index + 1 < imageIds.length) {
      onImageSelect(imageIds[index + 1]);
    }
  }

  handleCommentFormSubmit = (e) => {
    e.preventDefault();
    this.props.onCommentSubmit();
  }

  handleCommentChange = (e) => {
    this.props.onCommentChange(e.target.value);
  }

  render() {
    const { imageIds, activeImageId, onClose, onShowOnTheMap, image, comment, onStarsChange, authenticated } = this.props;
    const index = imageIds && imageIds.findIndex(id => id === activeImageId);
    const { title = '...', description, user, createdAt, takenAt, tags, comments, rating, myStars } = image || {};

    const loadingMeta = !image || image.id !== activeImageId;

    return (
      <Modal show onHide={onClose} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>
            Fotka {imageIds ? `${index + 1} / ${imageIds.length} ` : ''}{title && `- ${title}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="carousel">
            <div className="item active">
              <a
                href={`${API_URL}/gallery/pictures/${activeImageId}/image`}
                target="freemap_gallery_image"
              >
                <Image
                  className="gallery-image"
                  src={`${API_URL}/gallery/pictures/${activeImageId}/image`}
                  alt={title}
                />
              </a>
            </div>
            {imageIds &&
              <a
                className={`left carousel-control ${index < 1 ? 'disabled' : ''}`}
                onClick={this.handlePreviousClick}
              >
                <Glyphicon glyph="chevron-left" />
              </a>
            }
            {imageIds &&
              <a
                className={`right carousel-control ${index >= imageIds.length - 1 ? 'disabled' : ''}`}
                onClick={this.handleNextClick}
              >
                <Glyphicon glyph="chevron-right" />
              </a>
            }
          </div>
          {image && [
            <div key="meta">
              Nahral <b>{user.name}</b> dňa <b>{dateFormat.format(createdAt)}</b>
              {takenAt && <span>. Odfotené dňa <b>{dateFormat.format(takenAt)}</b>.</span>}
              {' '}
              <ReactStars className="stars" size={22} value={rating / 2} edit={false} />
              {description && ` ${description}`}
              {tags.map(tag => <span key={tag}> <Label>{tag}</Label></span>)}
            </div>,
            <hr key="hr" />,
            <h5 key="comments-header">Komentáre</h5>,
            ...comments.map(c => (
              <p key={c.id}>
                {dateFormat.format(c.createdAt)} <b>{c.user.name}</b>: {c.comment}
              </p>
            )),
            authenticated && <form key="form" onSubmit={this.handleCommentFormSubmit}>
              <FormGroup>
                <InputGroup>
                  <FormControl type="text" placeholder="Nový komentár" value={comment} onChange={this.handleCommentChange} maxLength={4096} />
                  <InputGroup.Button>
                    <Button type="submit" disabled={comment.length < 1}>Pridaj</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </form>,
            authenticated && <div key="yourRating">
              Tvoje hodnotenie: <ReactStars className="stars" size={22} half={false} value={myStars} onChange={onStarsChange} />
            </div>,
          ]}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onShowOnTheMap}><FontAwesomeIcon icon="dot-circle-o" /> Ukázať na mape</Button>
          <Button onClick={onClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    imageIds: state.gallery.imageIds,
    image: state.gallery.image,
    activeImageId: state.gallery.activeImageId,
    zoom: state.map.zoom,
    pickingPosition: state.gallery.pickingPositionForId !== null,
    comment: state.gallery.comment,
    authenticated: !!state.auth.user,
  }),
  dispatch => ({
    onClose() {
      dispatch(galleryClear(null));
    },
    onShowOnTheMap() {
      dispatch(galleryShowOnTheMap());
      dispatch(galleryClear(null));
    },
    onImageSelect(id) {
      dispatch(galleryRequestImage(id));
    },
    onCommentChange(comment) {
      dispatch(gallerySetComment(comment));
    },
    onCommentSubmit() {
      dispatch(gallerySubmitComment());
    },
    onStarsChange(stars) {
      dispatch(gallerySubmitStars(stars));
    },
  }),
)(GalleryViewerModal);
