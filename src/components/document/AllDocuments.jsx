import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import toastr from 'toastr';
import ReactPaginate from 'react-paginate';
import { jsUcFirst } from '../../utils/helper.js';
import * as userActions from '../../actions/userActions';
import * as documentActions from '../../actions/documentActions';
import Sidebar from '../common/Sidebar.jsx';

/**
 * AllDocuments page view
 * @class AllDocuments
 * @extends {React.Component}
 */
export class AllDocuments extends Component {
  /**
   * Creates an instance of AllDocuments.
   * @param {any} props property of component
   * @param {any} context property of component
   * @returns {*} no return value
   * @memberof AllDocuments
   */
	constructor(props, context) {
    super(props, context);

    this.state = {
      isLoading: false,
			search: '',
			offset: 0
    };

		this.searchDocuments = this.searchDocuments.bind(this);
		this.clearSearch = this.clearSearch.bind(this);
		this.updateSearchState = this.updateSearchState.bind(this);
		this.handlePageClick = this.handlePageClick.bind(this);
  }

	/**
   * @desc handles the triggering of the necessary action
   * @returns {null} returns no value
   */
  componentWillMount() {
    if (this.props.isAuthenticated) {
			this.setState({ isLoading: true });
			this.props.documentActions.getAllDocuments(this.state.offset)
			.then(() => {
				this.setState({ isLoading: false });
			});
			this.props.userActions.getOneUser(this.props.authUser.id);
		}
  }

	/**
   * @desc handles change of the search
   * @param {any} event
   * @returns {*} no return value
   */
	searchDocuments(event) {
		event.preventDefault();
		this.setState({ isLoading: true });
		this.props.documentActions.searchAllDocuments(
			this.state.search, 0)
		.then(() => {
			toastr.success(this.props.message);
			this.setState({ isLoading: false });
		})
		.catch(() => {
			toastr.error(this.props.message);
			this.setState({ isLoading: false });
		});
	}

	/**
   * @desc handles change of the search state
   * @param {any} event
   * @returns {*} no return value
   */
	updateSearchState(event) {
		event.preventDefault();
		this.setState({ search: event.target.value });
	}

	/**
   * @desc handles clearing of the search form
   * @param {*} event
   * @returns {*} no return value
   */
	clearSearch(event) {
		event.preventDefault();
		this.props.documentActions.getAllDocuments(this.state.offset);
	}

	/**
   * @desc handles change of the pagination
   * @param {any} data the page number
   * @returns {*} no return value
   */
  handlePageClick(data) {
    const selected = data.selected;

    const offset = Math.ceil(selected
		* this.props.documents.metaData.pageSize);

    this.setState({ offset }, () => {
			if (this.props.documents.search) {
				this.props.documentActions.searchAllDocuments(
					this.state.search, offset);
			} else {
				this.props.documentActions.getAllDocuments(offset);
			}
    });
  }

  /**
   * Renders the view of the component
   * @returns {Object} react component to render
   * @memberOf Common
   */
  render() {
    const { user, documents } = this.props;
    let userDetails;
		let documentDetails;
		let pagination;

		if (documents.documents) {
			documentDetails = documents.documents;
			pagination = <ReactPaginate previousLabel={'previous'}
				nextLabel={'next'}
				breakLabel={'...'}
				breakClassName={'break-me'}
				pageCount={documents.metaData.pages
					? documents.metaData.pages : null}
				marginPagesDisplayed={2}
				pageRangeDisplayed={5}
				onPageChange={this.handlePageClick}
				containerClassName={'pagination'}
				subContainerClassName={'pages pagination'}
				nextClassName="next-button"
				activeClassName={'active'} />;
		} else {
			documentDetails = [];
			pagination = null;
		}

    if (user) {
      userDetails = <div>
				<div>Name: { user.firstname } { user.lastname }</div>
				<div>Username: {user.username}</div>
				<div>Email: {user.email}</div>
				<div>Role: {user.Role.title}</div>
				<div className="divider"></div>
				<Link to={`/user/${user.id}`}
					className="waves-effect btn brown">
				Update Profile</Link>
			</div>;
    }

		if (this.state.isLoading) {
      return (
      <div className="progress">
        <div className="indeterminate"></div>
      </div>
      );
    }
    return (
			<div className="container">
				<div className="section">
					<h4>General Documents</h4>
					<div className="divider"></div>
					<div className="row">
						<div className="col s12 m12 l9">
							<table className="striped responsive">
								<thead>
									<tr>
											<th>Title</th>
											<th>Author</th>
									</tr>
								</thead>

								<tbody>
									{documentDetails.map(document =>
										<tr key={document.id}>
											<td><h6>
												<Link
													className="docTitle"
													to={`/document/view/${document.id}`}>
												{jsUcFirst(document.title)}</Link>
											</h6></td>
											<td>
												{document.User.firstname} {document.User.lastname}
											</td>
										</tr>
									)}
								</tbody>
							</table>
              <div className="center">
								{pagination}
							</div>
						</div>
						<Sidebar
							userDetails={userDetails}
							clearSearch={this.clearSearch}
							updateSearchState={this.updateSearchState}
							search={this.searchDocuments} />
					</div>
				</div>
			</div>
    );
  }
}

/**
 * @desc Set the PropTypes
 */
AllDocuments.PropTypes = {
  message: PropTypes.string,
  isAuthenticated: PropTypes.bool.isRequired,
  userActions: PropTypes.object.isRequired,
	user: PropTypes.object,
	documents: PropTypes.array,
	authUser: PropTypes.object,
  documentActions: PropTypes.object.isRequired
};

/**
 * @desc Set the contextTypes
 */
AllDocuments.contextTypes = {
  router: PropTypes.object
};

/**
 *  map state to props
 *
 * @param {state} state
 * @returns {*} props
 */
const mapStateToProps = state => ({
  message: state.message,
  isAuthenticated: state.authenticated.isAuth,
  authUser: state.authenticated.user,
  user: state.users || null,
  documents: state.documents || []
});

/**
 *  map dispatch to props
 *
 * @param {*} dispatch
 * @returns {*} props
 */
const mapDispatchToProps = dispatch => ({
  userActions: bindActionCreators(userActions, dispatch),
  documentActions: bindActionCreators(documentActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AllDocuments);
